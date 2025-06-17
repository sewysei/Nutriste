import { UserModel } from "../../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { checkToken } from "./checkToken.js";
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
    const { valid, expired, decoded } = checkToken(token);
    if (!valid) {
      return res.status(401).json({
        status: "Failed",
        message: expired ? "Token expired." : "Token invalid.",
      });
    }
    const userId = decoded.userId;
    let user = await UserModel.findById(userId);

    if (!userId && !user.isGoogleUser) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "Password dan confirm password tidak boleh kosong",
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

    const addPassword = true;
    res.status(200).json({
      status: "Success",
      message: "Password berhasil ditambahkan.",
      addPassword: addPassword,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
