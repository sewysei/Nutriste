import { UserModel } from "../../models/users.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({
      status: "Failed",
      message: "Token verifikasi tidak dapat ditemukan",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User tidak ditemukan",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: "Failed",
        message: "Email sudah terverifikasi. Silahkan log in",
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      status: "Success",
      message: "Berhasil memverifikasi email!",
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
