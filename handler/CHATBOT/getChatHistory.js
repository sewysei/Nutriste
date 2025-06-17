import { ChatHistory } from "../../models/chatbotHistory.js"; // sesuaikan path
import { checkToken } from "../AUTH/checkToken.js"; // sesuaikan path
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
    const { valid, expired, decoded } = checkToken(token);
    if (!valid) {
      return res.status(401).json({
        status: "Failed",
        message: expired ? "Token expired." : "Token invalid.",
      });
    }
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
