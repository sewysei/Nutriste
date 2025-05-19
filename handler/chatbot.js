import { GoogleGenAI } from "@google/genai";
import { ChatHistory } from "../models/chatbotHistory.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatSessions = {};

export const chatBot = async (req, res) => {
  try {
    const userId = req.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message diperlukan." });
    }

    // Inisialisasi sesi chat jika belum ada
    if (!chatSessions[userId]) {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({ history: [] });
      chatSessions[userId] = chat;
    }

    const chat = chatSessions[userId];
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    // Simpan ke MongoDB
    let chatDoc = await ChatHistory.findOne({ userId });
    if (!chatDoc) {
      chatDoc = new ChatHistory({ userId, messages: [] });
    }

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

    if (chatDoc.messages.length > 50) {
      chatDoc.messages = chatDoc.messages.slice(-50); // simpan 100 terakhir
    }

    await chatDoc.save();

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Gagal memproses percakapan." });
  }
};
