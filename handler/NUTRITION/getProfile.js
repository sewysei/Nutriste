import { HealthProfileModel } from "../../models/healthData.js";
import { checkToken } from "../AUTH/checkToken.js"; // sesuaikan path
import dotenv from "dotenv";
dotenv.config();

export const getProfile = async (req, res) => {
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
    // Check if userId is present
    if (!userId) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }
    const checkUser = await HealthProfileModel.findOne({ userId });
    if (!checkUser) {
      return res.status(404).json({
        status: "Failed",
        message:
          "Profil Kesehatan tidak ditemukan. Mohon mengisi data di profil terlebih dahulu.",
      });
    } else {
      res.status(200).json({
        status: "Success",
        msg: "Profil Kesehatan ditemukan.",
        data: checkUser,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
