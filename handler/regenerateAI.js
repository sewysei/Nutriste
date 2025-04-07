import { GoogleGenAI } from "@google/genai";
import { MealPlanModel } from "../models/mealPlan.js";
import { NutritionDataModel } from "../models/nutrition.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const regenerateAIPlans = async (profile) => {
  const { age, gender, height, weight, healthCondition, purposes, userId } =
    profile;

  try {
    // Meal Plan
    const mealPlanResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give me meal plan for people with characteristics such as
      - Age: ${age}
      - Gender: ${gender}
      - Height: ${height} cm
      - Weight: ${weight} kg
      - Health Conditions: ${healthCondition}
      - Goal: ${purposes};
      Keep the answer simple and under 300 words.`,
    });

    const mealPlanText = await mealPlanResponse.text();
    await MealPlanModel.findOneAndUpdate(
      { userId },
      { userId, response: mealPlanText },
      { upsert: true, new: true }
    );

    // Nutrition Suggestion
    const nutritionResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give me nutrition suggestion for people with characteristics such as
      - Age: ${age}
      - Gender: ${gender}
      - Height: ${height} cm
      - Weight: ${weight} kg
      - Health Conditions: ${healthCondition}
      - Goal: ${purposes};
      Keep the answer simple and under 300 words.`,
    });

    const nutritionText = await nutritionResponse.text();
    await NutritionDataModel.findOneAndUpdate(
      { userId },
      { userId, response: nutritionText },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("AI generation failed:", err.message);
  }
};
