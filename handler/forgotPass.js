import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: "Failed",
      message: "Email tidak boleh kosong",
    });
  }
  try {
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({
        status: "Failed",
        message: "Pengguna belum terdaftar. Silahkan daftar terlebih dahulu.",
      });
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
      html: `<p>Klik link ini untuk reset password:
             <a href="${resetLink}">${resetLink}</a></p>
             <p>Link akan kadaluarsa dalam 6 jam.</p>`,
    });
    res.status(200).json({
      status: "Success",
      message:
        "Email untuk me-reset password terkirim. Cek email Anda untuk reset password. ",
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};
