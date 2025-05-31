import { UserModel } from "../../models/users.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
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

    const verificationLink = `https://nutriste.vercel.app/verify-email?token=${token}`;

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
      html: `
    <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 5px;">
      <h2 style="text-align: center; color: #2c3e50;">Verifikasi Email Anda</h2>
      <p>Halo,</p>
      <p>Kami menerima permintaan untuk verifikasi email akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
      <p style="text-align: center; margin-top: 25px; margin-bottom: 25px;">
        <a href="${verificationLink}"
           target="_blank"
           style="background-color: #007bff; /* Warna latar tombol */
                  color: #ffffff; /* Warna teks tombol */
                  padding: 12px 25px; /* Padding di dalam tombol */
                  text-decoration: none; /* Hilangkan garis bawah link */
                  border-radius: 5px; /* Sudut tombol membulat */
                  font-weight: bold;
                  display: inline-block; /* Penting agar padding bekerja */
                  border: 1px solid #0056b3; /* Optional: border untuk efek 3D */
                  font-size: 16px;">
          Reset Password
        </a>
      </p>
      <p>Link ini akan kadaluarsa dalam 6 jam.</p>
      <p>Jika Anda tidak meminta verifikasi email, atau ini adalah kesalahan, silahkan abaikan email ini. Akun Anda tetap aman.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777777; text-align: center;">
        Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.
      </p>
    </div>
  `,
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
      message: `Catch error ${err.message}`,
    });
  }
};
