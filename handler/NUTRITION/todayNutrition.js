import { MealPlanModel } from "../../models/mealPlan.js";
import { checkToken } from "../AUTH/checkToken.js";
import { NutritionTargetModel } from "../../models/nutritionTarget.js";
import dotenv from "dotenv";
dotenv.config();
export const getTodayNutrition = async (req, res) => {
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

    // Ambil data meal plan untuk hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlanData = await MealPlanModel.findOne({
      userId,
      updatedAt: { $gte: today },
    });

    if (!mealPlanData) {
      return res.status(404).json({
        status: "Failed",
        message: "Meal plan tidak ditemukan untuk hari ini.",
      });
    }
    const nutritionTarget = await NutritionTargetModel.findOne({ userId });

    if (!nutritionTarget) {
      return res.status(404).json({
        status: "Failed",
        message: "Target nutrisi tidak ditemukan.",
      });
    }
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbohydrates = 0;
    let totalFat = 0;
    // Hitung total kalori dan nutrisi
    for (const meal of mealPlanData.response.meal_plan) {
      totalCalories += meal.calories; // Pastikan ada properti calories
      totalProtein += meal.protein; // Pastikan ada properti protein
      totalCarbohydrates += meal.carbohydrates; // Pastikan ada properti carbohydrates
      totalFat = meal.fat; // Pastikan ada properti fat
    }

    res.status(200).json({
      status: "Success",
      totalCalories,
      totalProtein,
      totalCarbohydrates,
      totalFat,
      nutritionTarget,
    });
  } catch (error) {
    console.error("Error fetching today's nutrition:", error);
    res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan saat mengambil data nutrisi hari ini.",
    });
  }
};
