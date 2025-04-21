import { MealPlanModel } from "../models/mealPlan.js";
import { HealthProfileModel } from "../models/healthData.js"; // Needed to get user data
import { GoogleGenAI } from "@google/genai";
import { getImageForFoodBase64 } from "./getMealImage.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }
    // Check if meal plan already exists
    let mealPlanData = await MealPlanModel.findOne({ userId });
    const profile = await HealthProfileModel.findOne({ userId });
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of today

    const mealPlanOutdated =
      !mealPlanData ||
      profile.updatedAt > mealPlanData.updatedAt ||
      new Date(mealPlanData.updatedAt).setHours(0, 0, 0, 0) < today;

    if (mealPlanOutdated) {
      // Get user health profile to generate meal plan
      if (!profile) {
        return res.status(404).json({
          status: "Failed",
          message:
            "Profil Kesehatan tidak ditemukan. Mohon mengisi data di profil terlebih dahulu.",
        });
      }
      const { age, gender, height, weight, healthCondition, purposes } =
        profile;

      const mealPlanResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Buat perencanaan makanan untuk seorang ${gender} usia ${age}, 
        tinggi ${height} cm, berat ${weight} kg, dengan kondisi kesehatan ${healthCondition}, dan tujuan ${purposes}.
        Tulis hasil dalam format JSON. Jawaban tidak boleh lebih dari 300 kata.
        JSON harus berisi array dengan nama "meal_plan", dan setiap elemen adalah sebuah objek makanan dengan properti:
        - meal_time (waktu makan seperti: Sarapan, Makan Siang, Snack Sore)
        - food (nama makanan atau menu)
        - calories (jumlah kalori dalam angka)
        - protein (dalam gram, misalnya "20g")
        - carbohydrates (dalam gram)
        - fat (dalam gram)
        Jangan gunakan tanda cetak tebal, bintang, atau frasa pembuka seperti "Tentu" atau "Berikut adalah". Jawaban hanya JSON.
        Jangan gunakan backtick, tanda kutip tiga, atau format markdown lainnya.`,
      });

      const mealPlanText = mealPlanResponse.text;
      const cleanedText = mealPlanText.replace(/```json|```/g, "").trim();
      const mealPlanJson = JSON.parse(cleanedText);
      for (let item of mealPlanJson.meal_plan) {
        const imageBase64 = await getImageForFoodBase64(item.food);
        if (!imageBase64) {
          console.log(`Failed to fetch image for ${item.food}`);
          item.image = null; // jika gambar gagal didapatkan, beri nilai null atau placeholder
        } else {
          item.image = imageBase64;
        }
      }

      // Save new meal plan
      await MealPlanModel.updateOne(
        { userId },
        {
          $set: {
            response: mealPlanJson,
            updatedAt: new Date(),
          },
        },
        { upsert: true } // this will insert if it doesn't exist
      );
      return res.status(200).json({
        status: "Failed",
        message: "Success fetching data",
        suggestion: mealPlanText,
      });
    }
    return res.status(200).json({
      status: "Failed",
      message: "Success fetching data",
      suggestion: mealPlanData.response,
    });
  } catch (error) {
    console.error("Error generating meal plan:", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Failed to fetch suggestion",
    });
  }
};
