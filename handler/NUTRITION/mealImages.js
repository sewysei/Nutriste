import { getImageForFoodBase64 } from "./getMealImage.js";
import { MealPlanModel } from "../../models/mealPlan.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getMealImage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "Failed",
        message: "Tidak ada token dikirim.",
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    // Check if userId is present
    if (!userId) {
      return res.status(401).json({
        status: "Failed",
        message: "Akses ditolak.",
      });
    }

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
      if (!item.image) {
        const base64Image = await getImageForFoodBase64(item.food);
        item.image = base64Image || null;
      }
    }

    mealPlan.updatedAt = new Date();
    mealPlan.markModified("response");
    await mealPlan.save();

    return res.status(200).json({
      status: "Success",
      message: "Gambar berhasil ditambahkan ke meal plan dan disimpan",
      updatedMealPlan: mealPlan.response,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
