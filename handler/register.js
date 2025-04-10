import { UserModel } from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "./sendMail.js";
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
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    await sendVerificationEmail(email, token);

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
