import { GoogleGenAI } from "@google/genai";
import { ChatHistory } from "../models/chatbotHistory.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Menyimpan sesi berdasarkan userId
const chatSessions = {};

export const chatBot = async (req, res) => {
  try {
    const userId = req.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message diperlukan." });
    }

    // Ambil riwayat sebelumnya dari MongoDB
    let chatDoc = await ChatHistory.findOne({ userId });
    if (!chatDoc) {
      chatDoc = new ChatHistory({ userId, messages: [] });
    }

    // Siapkan riwayat dalam format untuk Gemini
    const history = chatDoc.messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Buat sesi chat jika belum ada
    if (!chatSessions[userId]) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({ history });
      chatSessions[userId] = chat;
    }

    const chat = chatSessions[userId];

    // Kirim pesan
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    // Simpan riwayat ke MongoDB
    chatDoc.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });
    chatDoc.messages.push({
      role: "bot",
      content: reply,
      timestamp: new Date(),
    });

    // Batasi panjang riwayat
    if (chatDoc.messages.length > 50) {
      chatDoc.messages = chatDoc.messages.slice(-50);
    }

    await chatDoc.save();

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Gagal memproses percakapan." });
  }
};
