import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!newPassword) {
    return res.status(400).json({
      status: "Failed",
      msg: "Password baru tidak boleh kosong.",
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      status: "Failed",
      message:
        "Password harus setidaknya 8 karakter dan mengandung setidaknya satu huruf dan satu angka.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const checkUser = await UserModel.findById(decoded.userId);

    if (!checkUser) {
      return res.status(404).json({
        status: "Failed",
        msg: "Pengguna tidak ditemukan.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    checkUser.password = hashedPassword;
    await checkUser.save();

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
