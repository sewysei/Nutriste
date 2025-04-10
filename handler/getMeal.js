import { MealPlanModel } from "../models/mealPlan.js";
import { HealthProfileModel } from "../models/healthData.js"; // Needed to get user data
import { GoogleGenAI } from "@google/genai";
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
    if (!mealPlanData || profile.updatedAt > mealPlanData.updatedAt) {
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
        contents: `Berikan rencana makanan untuk seseorang dengan:
        - Umur: ${age}
        - Gender: ${gender}
        - Tinggi: ${height} cm
        - Berat: ${weight} kg
        - Kondisi Kesehatan: ${healthCondition}
        - Tujuan  : ${purposes}
        Berikan jawaban yang simpel dan dibawah 300 kata. Formatkan teks tanpa tanda bintang (**), 
        tanpa cetak tebal, dan tanpa frasa pembuka seperti "Tentu" atau "Berikut adalah". `,
      });

      const mealPlanText = mealPlanResponse.text;

      // Save new meal plan
      await MealPlanModel.updateOne(
        { userId },
        {
          $set: {
            response: mealPlanText,
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
