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
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if suggestion already exists
    let nutritionData = await NutritionDataModel.findOne({ userId });

    const profile = await HealthProfileModel.findOne({ userId });
    if (!nutritionData || profile.updatedAt > nutritionData.updatedAt) {
      // If not found, generate based on profile
      if (!profile) {
        return res.status(404).json({
          message:
            "Health profile not found. Please fill in your profile first.",
        });
      }

      const { age, gender, height, weight, healthCondition, purposes } =
        profile;

      const nutritionResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Give me a nutrition suggestion for a person with the following:
        - Age: ${age}
        - Gender: ${gender}
        - Height: ${height} cm
        - Weight: ${weight} kg
        - Health Conditions: ${healthCondition}
        - Goal: ${purposes}
        Keep the answer simple and under 300 words.`,
      });

      const nutritionText = nutritionResponse.text;
      if (!nutritionText) {
        return res
          .status(500)
          .json({ message: "Failed to generate suggestion" });
      }
      const newNutritionData = new NutritionDataModel({
        userId,
        response: nutritionText,
      });

      nutritionData = await newNutritionData.save(); // Save and use this data
    }

    return res.status(200).json({
      message: "Success fetching data",
      suggestion: nutritionData.response,
    });
  } catch (err) {
    console.error("Error generating nutrition suggestion:", err.message);
    res.status(500).json({ message: "Failed to fetch suggestion" });
  }
};
