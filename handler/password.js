import { UserModel } from "../models/users";
import { sendVerificationEmail } from "./sendMail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const googlePassword = async (req, res) => {
  try {
    const userId = req.userId;
    let user = await UserModel.findById({ userId });

    if (!userId && !user.isGoogleUser) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "Password dan confirm password tidak boleh kosong",
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

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    const verifyToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    await sendVerificationEmail(user.email, verifyToken);

    await user.save();

    res.status(200).json({
      status: "Success",
      message:
        "Password berhasil ditambahkan. Untuk login manual silahkan cek email kamu untuk verifikasi akun.",
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};
