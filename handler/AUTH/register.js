import { UserModel } from "../../models/users.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, agreedToTerms } =
      req.body;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "Failed",
        message: "Email sudah terdaftar",
      });
    }

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "Username, email, dan password tidak boleh kosong",
      });
    }

    const usedUsername = await UserModel.findOne({ username });
    if (usedUsername) {
      return res.status(400).json({
        status: "Failed",
        message: "Username sudah diambil",
      });
    }

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        status: "Failed",
        message:
          "Username harus diantara 3-20 karakter dan hanya mengandung huruf, angka, dan underscore.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "Failed",
        message: "Tolong masukkan email yang valid.",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "Failed",
        message:
          "Password harus setidaknya 8 karakter dan mengandung setidaknya satu huruf dan satu angka.",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "Password dan confirm password tidak cocok",
      });
    }

    if (!agreedToTerms) {
      return res.status(400).json({
        status: "Failed",
        message: "Kamu harus menyetujui Syarat & Kebijakan Privasi.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ username, email, password: hashedPassword });
    const savedUser = await user.save();

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await savedUser.updateOne({ $set: { otp, otpExpires } });

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
      subject: "Verifikasi Email",
      html: `<p>Kode OTP Anda adalah: ${otp}</p>
             <p>Kode akan kadaluarsa dalam 10 menit.</p>`,
    });

    res.status(200).json({
      status: "Success",
      message: "Pendaftaran berhasil, cek email Anda untuk verifikasi",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};
