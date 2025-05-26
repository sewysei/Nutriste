import { UserModel } from "../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const resetPassword = async (req, res) => {
  const checkOtp = req.userOTP;
  const { newPassword, confirmPassword } = req.body;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!checkOtp) {
    return res.status(401).json({
      status: "Failed",
      message: "Akses ditolak.",
    });
  }

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      status: "Failed",
      message: "Password baru tidak boleh kosong.",
    });
  }

  if (newPassword != confirmPassword) {
    return res.status(400).json({
      status: "Failed",
      message: "Password tidak cocok",
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      status: "Failed",
      message:
        "Password harus setidaknya 8 karakter dan mengandung setidaknya satu huruf dan satu angka.",
    });
  }

  try {
    const checkUser = await UserModel.findOne({ otp: checkOtp });

    if (!checkUser) {
      return res.status(404).json({
        status: "Failed",
        message: "User tidak ditemukan.",
      });
    }

    if (!checkUser.otpVerified) {
      return res.status(400).json({
        status: "Failed",
        message: "Verifikasi OTP terlebih dahulu!",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (checkUser.password === hashedPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "Password baru tidak boleh sama dengan password lama.",
      });
    }

    checkUser.password = hashedPassword;
    await checkUser.updateOne({
      $unset: {
        otpVerified: "",
        otp: "",
        otpExpires: "",
      },
    });
    await checkUser.save();

    res.clearCookie("otp", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      status: "Success",
      msg: "Reset password berhasil.",
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      msg: "Token tidak valid atau kadaluarsa.",
    });
  }
};
