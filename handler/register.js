import { UserModel } from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "./sendMail.js";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(500).json({
        status: "Failed",
        message: "Username, email, and password are required.",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "Failed",
        message: "Email is already registered.",
      });
    }

    const usedUsername = await UserModel.findOne({ username });
    if (usedUsername) {
      return res.status(400).json({
        status: "Failed",
        message: "Username is already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ username, email, password: hashedPassword });
    const savedUser = await user.save();
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    await sendVerificationEmail(email, token);

    res.status(200).json({
      msg: "Register succesful, please check your email for verification",
      savedUser,
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};
