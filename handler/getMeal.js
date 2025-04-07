import { MealPlanModel } from "../models/mealPlan.js";
import { HealthProfileModel } from "../models/healthData.js"; // Needed to get user data
import { regenerateNutritionAndMeal } from "./regenerateAI.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if meal plan already exists
    let mealPlanData = await MealPlanModel.findOne({ userId });
    if (!mealPlanData) {
      // Get user health profile to generate meal plan
      const profile = await HealthProfileModel.findOne({ userId });
      if (!profile) {
        return res.status(404).json({
          message:
            "Health profile not found. Please fill in your profile first.",
        });
      }
      if (profile.createdAt < profile.updatedAt) {
        await regenerateNutritionAndMeal(userId, profile);
        mealPlanData = await MealPlanModel.findOne({ userId });
        return res.status(200).json({
          message: "Success update meal plan",
          response: mealPlanData.response,
        });
      }
      const { age, gender, height, weight, healthCondition, purposes } =
        profile;

      const mealPlanResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Give me a meal plan for a person with the following:
        - Age: ${age}
        - Gender: ${gender}
        - Height: ${height} cm
        - Weight: ${weight} kg
        - Health Conditions: ${healthCondition}
        - Goal: ${purposes}
        Keep the answer simple and under 300 words.`,
      });

      const mealPlanText = mealPlanResponse.text;

      // Save new meal plan
      const newMealPlan = new MealPlanModel({
        userId,
        response: mealPlanText,
      });

      mealPlanData = await newMealPlan.save(); // Save and update reference
    }

    return res.status(200).json({
      message: "Success fetching data",
      suggestion: mealPlanData.response,
    });
  } catch (error) {
    console.error("Error generating meal plan:", error.message);
    res.status(500).json({ message: "Failed to fetch suggestion" });
  }
};
