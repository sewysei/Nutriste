import { getImageForFoodBase64 } from "./getMealImage.js";
import { MealPlanModel } from "../../models/mealPlan.js";

export const getMealImageByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("userId tidak valid");
    }

    const mealPlan = await MealPlanModel.findOne({ userId });

    if (
      !mealPlan ||
      !mealPlan.response ||
      !Array.isArray(mealPlan.response.meal_plan)
    ) {
      throw new Error("Data meal plan tidak ditemukan.");
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

    return {
      status: "Success",
      message: "Gambar berhasil ditambahkan ke meal plan dan disimpan",
      updatedMealPlan: mealPlan.response,
    };
  } catch (err) {
    throw new Error("Gagal mengambil gambar meal: " + err.message);
  }
};
