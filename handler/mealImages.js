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

    for (let item of mealItems) {
      const base64Image = await getImageForFoodBase64(item.food);
      item.image = base64Image;
    }

    // Update ke database
    mealPlan.updatedAt = new Date(); // optionally update timestamp
    await mealPlan.save();

    return res.status(200).json({
      status: "Success",
      message: "Gambar berhasil ditambahkan ke meal plan dan disimpan",
      updatedMealPlan: mealPlan.response.image,
    });
  } catch (error) {
    console.error("Error saving images to DB:", error.message);
    return res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan saat menyimpan gambar ke database.",
    });
  }
};
