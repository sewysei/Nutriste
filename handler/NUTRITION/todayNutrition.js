import { MealPlanModel } from "../../models/mealPlan.js";
import { checkToken } from "../AUTH/checkToken.js";
import { NutritionTargetModel } from "../../models/nutritionTarget.js ";
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

    let percentageCalories = (totalCalories / nutritionTarget.calorie) * 100;
    let percentageProtein = (totalProtein / nutritionTarget.protein) * 100;
    let percentageCarbohydrates =
      (totalCarbohydrates / nutritionTarget.carbohydrate) * 100;
    let percentageFat = (totalFat / nutritionTarget.fat) * 100;

    if (percentageCalories > 100) {
      percentageCalories = 100;
    }
    if (percentageProtein > 100) {
      percentageProtein = 100;
    }
    if (percentageCarbohydrates > 100) {
      percentageCarbohydrates = 100;
    }
    if (percentageFat > 100) {
      percentageFat = 100;
    }
    // Kembalikan data nutrisi hari ini
    let calorieStatus = "Cukup";
    let calorieMessage = "";
    let carbohydrateStatus = "Cukup";
    let carbohydrateMessage = "";
    let proteinStatus = "Cukup";
    let proteinMessage = "";
    let fatStatus = "Cukup";
    let fatMessage = "";
    if (nutritionTarget.calorieDiff === "0") {
      calorieStatus = "Cukup";
      calorieMessage = `Kalori Cukup!`;
    } else if (nutritionTarget.calorieDiff > 0) {
      calorieStatus = "Kekurangan";
      calorieMessage = `Kurang ${Math.abs(
        nutritionTarget.calorieDiff
      )}Kcal Kalori`;
    } else {
      calorieStatus = "Kelebihan";
      calorieMessage = `Kelebihan ${Math.abs(
        nutritionTarget.calorieDiff
      )}Kcal Kalori`;
    }
    if (nutritionTarget.carbohydrateDiff === "0") {
      carbohydrateStatus = "Cukup";
      carbohydrateMessage = `Karbohidrat Cukup!`;
    } else if (nutritionTarget.carbohydrateDiff > 0) {
      carbohydrateStatus = "Kekurangan";
      carbohydrateMessage = `Kurang ${Math.abs(
        nutritionTarget.carbohydrateDiff
      )}g Karbohidrat`;
    } else {
      carbohydrateStatus = "Kelebihan";
      carbohydrateMessage = `Kelebihan ${Math.abs(
        nutritionTarget.carbohydrateDiff
      )}g Karbohidrat`;
    }
    if (nutritionTarget.proteinDiff === "0") {
      proteinStatus = "Cukup";
      proteinMessage = `Protein Cukup!`;
    } else if (nutritionTarget.proteinDiff > 0) {
      proteinStatus = "Kekurangan";
      proteinMessage = `Kurang ${Math.abs(
        nutritionTarget.proteinDiff
      )}g Protein`;
    } else {
      proteinStatus = "Kelebihan";
      proteinMessage = `Kelebihan ${Math.abs(
        nutritionTarget.proteinDiff
      )}g Protein`;
    }
    if (nutritionTarget.fatDiff === "0") {
      fatStatus = "Cukup";
      fatMessage = `Lemak Cukup!`;
    } else if (nutritionTarget.fatDiff > 0) {
      fatStatus = "Kekurangan";
      fatMessage = `Kurang ${Math.abs(nutritionTarget.fatDiff)}g Lemak`;
    } else {
      fatStatus = "Kelebihan";
      fatMessage = `Kelebihan ${Math.abs(nutritionTarget.fatDiff)}g Lemak`;
    }

    const nutritionData = [
      {
        name: "Kalori",
        value: totalCalories,
        target: nutritionTarget.calorie,
        percentage: percentageCalories.toFixed(2),
        difference: nutritionTarget.calorieDiff,
        status: calorieStatus,
        message: calorieMessage,
      },
      {
        name: "Protein",
        value: totalProtein,
        target: nutritionTarget.protein,
        percentage: percentageProtein.toFixed(2),
        difference: nutritionTarget.proteinDiff,
        status: proteinStatus,
        message: proteinMessage,
      },
      {
        name: "Karbohidrat",
        value: totalCarbohydrates,
        target: nutritionTarget.carbohydrate,
        percentage: percentageCarbohydrates.toFixed(2),
        difference: nutritionTarget.carbohydrateDiff,
        status: carbohydrateStatus,
        message: carbohydrateMessage,
      },
      {
        name: "Lemak",
        value: totalFat,
        target: nutritionTarget.fat,
        percentage: percentageFat.toFixed(2),
        difference: nutritionTarget.fatDiff,
        status: fatStatus,
        message: fatMessage,
      },
    ];

    res.status(200).json({
      status: "Success",
      message: "Berhasil mengambil data nutrisi hari ini.",
      nutritionData,
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
