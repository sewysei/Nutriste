import { UserModel } from "../../models/users.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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
      html: `
            <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 5px;">
              <h2 style="text-align: center; color: #2c3e50;">Kode OTP Verifikasi Anda</h2>
              <p>Halo,</p>
              <p>Kami menerima permintaan untuk mengganti password. Gunakan kode OTP di bawah ini untuk melanjutkan proses penggantian password:</p>
              <p style="text-align: center; font-size: 24px; font-weight: bold; color: #007bff; margin: 25px 0;">${otp}</p>
              <p>Kode ini hanya berlaku selama <strong>5 menit</strong>. Mohon jangan membagikan kode ini kepada siapa pun.</p>
              <p>Jika Anda tidak merasa meminta kode OTP ini, silakan abaikan email ini. Akun Anda tetap aman.</p>
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
              <p style="font-size: 12px; color: #777777; text-align: center;">Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</p>
            </div>`,
    });

    return res.status(200).json({
      status: "Success",
      message: "Kode OTP untuk me-reset password terkirim. Cek email Anda.",
      otp,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
