import { NutritionDataModel } from "../models/nutrition.js";
import dotenv from "dotenv";
dotenv.config();

export const getNutritionSuggestion = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const existingNutritionData = await NutritionDataModel.findOne({ userId });
    if (!existingNutritionData) {
      return res
        .status(404)
        .json({
          message: "No nutrition suggestion found. Please update your profile",
        });
    }

    res.status(200).json({
      message: "Success fetching data from database",
      suggestion: existingNutritionData.response,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
