import { ChatHistory } from "../../models/chatbotHistory.js"; // sesuaikan path

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
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
