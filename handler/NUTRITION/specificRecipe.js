import { MealPlanModel } from "../../models/mealPlan.js";
import { mealRecipeModel } from "../../models/recipe.js";
import { checkToken } from "../AUTH/checkToken.js"; // sesuaikan path
import dotenv from "dotenv";
dotenv.config();

export const getSpecificRecipe = async (req, res) => {
  const index = req.query.index;

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
  try {
    const recipe = await mealRecipeModel.findOne({ userId });
    const mealPlanData = await MealPlanModel.findOne({ userId });

    const mealPicture = mealPlanData.response.meal_plan[index].image;

    if (!recipe) {
      return res.status(404).json({
        status: "Failed",
        message: "Resep tidak ditemukan.",
      });
    }
    const specificRecipe = recipe.recipes.foods[index];
    if (!specificRecipe) {
      return res.status(404).json({
        status: "Failed",
        message: "Resep tidak ditemukan pada indeks tersebut.",
      });
    }
    return res.status(200).json({
      status: "Success",
      message: "Berhasil mendapatkan resep spesifik.",
      recipe: specificRecipe,
      image: mealPicture,
    });
  } catch (error) {
    console.error("Error fetching specific recipe:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan saat mengambil resep. " + error.message,
    });
  }
};
