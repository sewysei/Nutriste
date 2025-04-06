import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Email is required." });
  }
  try {
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res
        .status(400)
        .json({ msg: "User is not registered. Please register first." });
    }

    const resetToken = jwt.sign(
      { userId: checkUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "6h",
      }
    );
    const resetLink = `https://nutriste.vercel.app/reset-password?token=${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click here to reset your password:
             <a href="${resetLink}">${resetLink}</a></p>
             <p>This link expires in 6 hour.</p>`,
    });
    res.status(200).json({ msg: "Reset password email sent." });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};
