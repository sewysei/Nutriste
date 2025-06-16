import { HealthProfileModel } from "../../models/healthData.js";
import jwt from "jsonwebtoken";
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
