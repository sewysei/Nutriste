import { MealPlanModel } from "../../models/mealPlan.js";
import { HealthProfileModel } from "../../models/healthData.js"; // Needed to get user data
import { getCalories } from "./countCalories.js";
import { GoogleGenAI } from "@google/genai";
import { checkToken } from "../AUTH/checkToken.js"; // sesuaikan path

import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMealPlan = async (req, res) => {
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
    // Check if userId is present
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
      const {
        age,
        gender,
        height,
        weight,
        healthCondition,
        foodRestrictions,
        activity,
        activeStatus,
        mealsPerDay,
        favouriteFood,
        purposes,
      } = profile;

      const mealPlanResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Buat perencanaan makanan untuk seorang ${gender} usia ${age},
        tinggi ${height} cm, berat ${weight} kg, dengan kondisi kesehatan ${healthCondition}, pantang makan ${foodRestrictions},
        dengan aktivitas harian${activity} yang mempunyai tingkat keaktifan ${activeStatus}, makan ${mealsPerDay} setiap harinya, 
        mempunyai makanan favorit ${favouriteFood} dan tujuan ${purposes}.
        Tulis hasil dalam format JSON. Jawaban tidak boleh lebih dari 300 kata. Berikan saya Sarapan, Makan Siang, Snack, dan Makan Malam saja.
        Berikan makanan yang berbeda setiap generate.
        JSON harus berisi array dengan nama "meal_plan" yang hanya berisi 4 item, dan setiap elemen adalah sebuah objek makanan dengan properti:
        - index (nomor urut makanan, mulai dari 0)
        - meal_time (waktu makan seperti: Sarapan, Makan Siang, Snack, Makan Malam)
        - time(waktu makan dalam format HH:MM, misalnya 08:00) 
        - food (nama makanan taruh makanan yang fotonya diambil di paling depan,
          bagi setiap makanan dengan "-", misalnya "Nasi Goreng-Ayam Bakar-Ikan kukus" jangan gunakan "dan")
        - description (deskripsi singkat tentang makanan, misalnya "Nasi goreng dengan ayam bakar dan ikan kukus")
        - calories (jumlah kalori dalam perhitungan Kcal, misalnya 500)
        - protein (dalam gram, misalnya 20)
        - carbohydrates (dalam gram, misalnya 50)
        - fat (dalam gram, misalnya 10)
        - isEaten (boolean, dafault false)
        Jangan gunakan tanda cetak tebal, bintang, atau frasa pembuka seperti "Tentu" atau "Berikut adalah". Jawaban hanya JSON.
        Jangan gunakan backtick, tanda kutip tiga, atau format markdown lainnya.`, // keep same prompt
      });

      const mealPlanText = await mealPlanResponse.text;
      const cleanedText = await mealPlanText.replace(/```json|```/g, "").trim();
      const mealPlanJson = await JSON.parse(cleanedText);

      for (let item of mealPlanJson.meal_plan) {
        item.image = null;
      }

      await MealPlanModel.replaceOne(
        { userId },
        {
          userId,
          response: mealPlanJson,
          updatedAt: new Date(),
        },
        { upsert: true }
      );
      await getCalories(userId);
      return res.status(200).json({
        status: "Success",
        message: "Success updating meal plan",
        suggestion: mealPlanJson,
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
