import { UserModel } from "../../models/users.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

dotenv.config();

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return res.status(400).json({
      status: "Failed",
      message: "Email tidak boleh kosong",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: "Failed",
      message: "Tolong masukkan email yang valid.",
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

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    const otpVerified = false;

    await checkUser.updateOne({ $set: { otp, otpExpires, otpVerified } });

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
      subject: "Reset Password OTP Code",
      html: `<p>Kode OTP Anda adalah: ${otp}</p>
             <p>Kode akan kadaluarsa dalam 5 menit.</p>`,
    });

    const otpCookie = jwt.sign({ otp }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    res.cookie("otp", otpCookie, {
      httpOnly: true,
      secure: true, // use HTTPS in production
      sameSite: "Strict", // prevent CSRF
      maxAge: 10 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: "Success",
      message: "Kode OTP untuk me-reset password terkirim. Cek email Anda.",
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
