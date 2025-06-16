import { MealPlanModel } from "../../models/mealPlan.js";
import { HealthProfileModel } from "../../models/healthData.js"; // Needed to get user data
import { getCalories } from "./countCalories.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
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

    let mealPlanData = await MealPlanModel.findOne({ userId });
    const profile = await HealthProfileModel.findOne({ userId });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlanOutdated =
      !mealPlanData ||
      profile.updatedAt > mealPlanData.updatedAt ||
      new Date(mealPlanData.updatedAt).setHours(0, 0, 0, 0) < today;

    if (mealPlanOutdated) {
      const { age, gender, height, weight, healthCondition, purposes } =
        profile;

      const mealPlanResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Buat perencanaan makanan untuk seorang ${gender} usia ${age},
        tinggi ${height} cm, berat ${weight} kg, dengan kondisi kesehatan ${healthCondition}, dan tujuan ${purposes}.
        Tulis hasil dalam format JSON. Jawaban tidak boleh lebih dari 300 kata. Berikan saya Sarapan, Makan Siang, Snack, dan Makan Malam saja.
        Berikan juga makanan yang berbeda dari hari sebelumnya, kecuali jika tidak memungkinkan.
        JSON harus berisi array dengan nama "meal_plan", dan setiap elemen adalah sebuah objek makanan dengan properti:
        - meal_time (waktu makan seperti: Sarapan, Makan Siang, Snack, Makan Malam)
        - food (nama makanan atau menu)
        - calories (jumlah kalori dalam perhitungan Kcal, misalnya 500)
        - protein (dalam gram, misalnya "20g")
        - carbohydrates (dalam gram)
        - fat (dalam gram)
        Jangan gunakan tanda cetak tebal, bintang, atau frasa pembuka seperti "Tentu" atau "Berikut adalah". Jawaban hanya JSON.
        Jangan gunakan backtick, tanda kutip tiga, atau format markdown lainnya.`, // keep same prompt
      });

      const mealPlanText = mealPlanResponse.text;
      const cleanedText = mealPlanText.replace(/```json|```/g, "").trim();
      const mealPlanJson = JSON.parse(cleanedText);

      for (let item of mealPlanJson.meal_plan) {
        item.image = null;
      }

      const existingRecipeId = mealPlanData?.recipeId || nanoid(10);

      await MealPlanModel.updateOne(
        { userId },
        {
          $set: {
            response: mealPlanJson,
            updatedAt: new Date(),
            recipeId: existingRecipeId,
          },
        },
        { upsert: true }
      );
      await getCalories(userId);
      return res.status(200).json({
        status: "Success",
        message: "Success updating meal plan",
        suggestion: mealPlanText,
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Success fetching meal plan from database",
      suggestion: mealPlanData.response,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
