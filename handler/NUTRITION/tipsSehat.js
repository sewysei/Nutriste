import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getTips = async (req, res) => {
  const funFact = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Berikan saya tips sehat. Jawaban harus berupa sebuah array yang berisi objek dengan ketentuan: 
    {
        judul: string, // judul tips
        deskripsi: string // deskripsi tips
    }.
    Jangan gunakan tanda cetak tebal, bintang, atau frasa pembuka seperti "Tentu" atau "Berikut adalah". Jawaban hanya string.
    Jangan gunakan backtick, tanda kutip tiga, atau format markdown lainnya. Berikan 4 tips saja
    Berikan saya tips yang belum pernah saya dengar sebelumnya, dan tidak terlalu umum.`,
  });
  const funFactText = funFact.text;
  const cleanedText = funFactText.replace(/```json|```/g, "").trim();
  return res.status(200).json({
    status: "Success",
    message: "Tips sehat berhasil diambil.",
    data: cleanedText,
  });
};
