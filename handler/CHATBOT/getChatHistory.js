import { ChatHistory } from "../../models/chatbotHistory.js"; // sesuaikan path
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getChatHistory = async (req, res) => {
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
    if (!userId) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }

    const history = await ChatHistory.findOne({ userId });

    if (!history) {
      return res.status(404).json({ error: "Riwayat tidak ditemukan." });
    }

    res.status(200).json({ messages: history.messages });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
