import { GoogleGenAI } from "@google/genai";
import { MealPlanModel } from "../models/mealPlan";
import { NutritionDataModel } from "../models/nutrition";
import dotenv from "dotenv";
import { HealthProfileModel } from "../models/healthData";
dotenv.config();

export const regenerateNutritionAndMeal = async (userId, userProfile) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // Nutrition Suggestion
    const mealPlanResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give me meal plan for people with characteristics such as
      - Age: ${userProfile.age}
      - Gender: ${userProfile.gender}
      - Height: ${userProfile.height} cm
      - Weight: ${userProfile.weight} kg
      - Health Conditions: ${userProfile.healthCondition}
      - Goal: ${userProfile.purposes};
      Keep the answer simple and under 300 words.`,
    });
    const mealPlanText = mealPlanResponse.text;
    await HealthProfileModel.updateOne(
      { userId },
      {
        $set: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true } // create if not exist
    );
    await MealPlanModel.updateOne(
      { userId },
      {
        $set: {
          response: mealPlanText,
        },
      },
      { upsert: true } // create if not exist
    );
    const nutritionResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give me nutrition suggestion for people with characteristics such as
          - Age: ${userProfile.age}
          - Gender: ${userProfile.gender}
          - Height: ${userProfile.height} cm
          - Weight: ${userProfile.weight} kg
          - Health Conditions: ${userProfile.healthCondition}
          - Goal: ${userProfile.purposes};
          Keep the answer simple and under 300 words.`,
    });
    const nutritionText = nutritionResponse.text;

    await NutritionDataModel.updateOne(
      { userId },
      {
        $set: {
          response: nutritionText,
        },
      },
      { upsert: true } // create if not exist
    );
  } catch (err) {
    console.error("AI generation failed:", err.message);
  }
};
