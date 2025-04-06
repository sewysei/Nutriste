import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required." });
  }
  try {
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }
    if (!checkUser.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please verify your email before logging in." });
    }
    const isMatch = await bcrypt.compare(password, checkUser.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }
    const token = jwt.sign({ userId: checkUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // use HTTPS in production
      sameSite: "Strict", // prevent CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        username: checkUser.username,
        email: checkUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};
