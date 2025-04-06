import { HealthProfileModel } from "../models/healthData";
import { NutritionDataModel } from "../models/nutrition";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

export const getNutritionSuggestion = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user's health data
    const userData = await HealthProfileModel.findOne({ userId });
    if (!userData) {
      return res.status(404).json({
        message:
          "No health data found for this user, please input information in your profile first",
      });
    }

    const existingNutritionData = await NutritionDataModel.findOne({ userId });
    if (!existingNutritionData) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Give me nutrition suggestion for people with characteristics such as
        - Age: ${userData.age}
        - Gender: ${userData.gender}
        - Height: ${userData.height} cm
        - Weight: ${userData.weight} kg
        - Health Conditions: ${userData.healthCondition}
        - Goal: ${userData.purposes};
        Keep the answer simple and under 300 words`,
      });

      const suggestion = await aiResponse.text();
      const savedData = await NutritionDataModel.create({
        userId,
        suggestion,
      });

      res.status(200).json({
        message: "Success Generate new data",
        suggestion: savedData.suggestion,
      });
    } else {
      res.status(200).json({
        message: "Success Fetching data from database",
        suggestion: existingNutritionData.suggestion,
      });
    }
  } catch (error) {
    console.error("Error generating nutrition suggestion", error);
    res.status(500).json({ message: "Failed to generate suggestion" });
  }
};
