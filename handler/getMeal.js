import { MealPlanModel } from "../models/mealPlan.js";
import dotenv from "dotenv";
dotenv.config();

export const getMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mealPlanData = await MealPlanModel.findOne({ userId });
    if (!mealPlanData) {
      return res.status(404).json({
        message:
          "No meal plan data found. Please update your profile to generate meal plans.",
      });
    }

    return res.status(200).json({
      message: "Success fetching data",
      suggestion: mealPlanData.response,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suggestion" });
  }
};
