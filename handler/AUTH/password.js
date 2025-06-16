import { UserModel } from "../../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const googlePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "Failed",
        message: "Tidak ada token dikirim.",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    let user = await UserModel.findById(userId);

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
          "Password harus setidaknya 8 karakter dan mengandung setidaknya satu huruf dan satu angka. Jangan gunakan spasi untuk password",
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

    await user.save();

    res.status(200).json({
      status: "Success",
      message:
        "Password berhasil ditambahkan. Untuk login manual silahkan cek email kamu untuk verifikasi akun.",
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
