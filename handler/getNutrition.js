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
        contents: `Buat saran nutrisi untuk seorang ${gender} usia ${age}, 
        tinggi ${height} cm, berat ${weight} kg, dengan kondisi kesehatan ${healthCondition}, dan tujuan ${purposes}.
        Tuliskan output dalam format JSON saja. Tidak ada penjelasan atau teks di luar JSON.
        Format JSON harus memiliki struktur:
        {
          "nutrition_advice": {
            "calorie_needs": "Jumlah kalori harian yang disarankan dalam kkal",
            "protein": "Saran asupan protein harian dan alasan",
            "carbohydrates": "Saran asupan karbohidrat harian dan alasan",
            "fat": "Saran asupan lemak harian dan alasan",
            "vitamins_minerals": "Vitamin/mineral yang perlu diperhatikan",
            "hydration": "Saran konsumsi air",
            "overall_tips": "Tips tambahan secara umum untuk mencapai tujuan"
          }
        }
        Jawaban maksimal 300 kata secara keseluruhan. Jangan gunakan tanda bintang, cetak tebal, atau frasa pembuka seperti 'Berikut adalah' atau 'Tentu'.
        `,
      });

      const nutritionText = nutritionResponse.text;
      const nutritionJson = JSON.parse(mealPlanText);
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
            response: nutritionJson,
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
