// controllers/mealImageController.js
import { getImageForFoodBase64 } from "./getMealImage.js";
import { MealPlanModel } from "../models/mealPlan.js";

export const getMealImage = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak. User tidak terautentikasi.",
      });
    }

    // Ambil meal plan dari DB
    const mealPlan = await MealPlanModel.findOne({ userId });

    if (
      !mealPlan ||
      !mealPlan.response ||
      !Array.isArray(mealPlan.response.meal_plan)
    ) {
      return res.status(404).json({
        status: "Failed",
        message: "Data meal plan tidak ditemukan.",
      });
    }

    const mealItems = mealPlan.response.meal_plan;

    // Buat array hasil dengan gambar
    const result = [];

    for (const item of mealItems) {
      const base64Image = await getImageForFoodBase64(item.food);
      result.push({
        meal_time: item.meal_time,
        food: item.food,
        image: base64Image || null,
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Gambar berhasil diambil dari meal plan",
      images: result,
    });
  } catch (error) {
    console.error("Error fetching meal images:", error.message);
    return res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan saat mengambil gambar.",
    });
  }
};
