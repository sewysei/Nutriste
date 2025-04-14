import { NutritionDataModel } from "../models/nutrition.js";
import { HealthProfileModel } from "../models/healthData.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getNutritionSuggestion = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }

    // Check if suggestion already exists
    let nutritionData = await NutritionDataModel.findOne({ userId });

    const profile = await HealthProfileModel.findOne({ userId });
    if (!nutritionData || profile.updatedAt > nutritionData.updatedAt) {
      // If not found, generate based on profile
      if (!profile) {
        return res.status(404).json({
          status: "Failed",
          message:
            "Profil Kesehatan tidak ditemukan. Mohon mengisi data di profil terlebih dahulu.",
        });
      }

      const { age, gender, height, weight, healthCondition, purposes } =
        profile;

      const nutritionResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Berikan saran nutrisi untuk seseorang dengan:
        - Umur: ${age}
        - Gender: ${gender}
        - Tinggi: ${height} cm
        - Berat: ${weight} kg
        - Kondisi Kesehatan: ${healthCondition}
        - Tujuan: ${purposes}
        Berikan jawaban dibawah 300 kata. Jangan berikan rekomendasi mengenai makanan, berikan saran nutrisinya saja.
        Formatkan teks tanpa tanda bintang (**), 
        tanpa cetak tebal, dan tanpa frasa pembuka seperti "Tentu" atau "Berikut adalah".`,
      });

      const nutritionText = nutritionResponse.text;
      if (!nutritionText) {
        return res.status(500).json({
          status: "Failed",
          message: "Gagal menghasilkan saran nutrisi.",
        });
      }

      await NutritionDataModel.updateOne(
        { userId },
        {
          $set: {
            response: nutritionText,
            updatedAt: new Date(),
          },
        },
        { upsert: true } // this will insert if it doesn't exist
      );
      return res.status(200).json({
        status: "Success",
        message: "Berhasil membuat data nutrisi. ",
        suggestion: nutritionText,
      }); // Save and use this data
    }
    return res.status(200).json({
      status: "Success",
      message: "Berhasil mengambil data dari database.",
      suggestion: nutritionData.response,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};
