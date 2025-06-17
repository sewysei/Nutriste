import { MealPlanModel } from "../../models/mealPlan.js";

export const getNutritionSummary = async (userId) => {
  try {
    const mealPlan = await MealPlanModel.findOne({ userId });

    if (!mealPlan || !mealPlan.response || !mealPlan.response.meal_plan) {
      return {
        status: "Failed",
        message: "Meal plan tidak ditemukan.",
        summary: null,
      };
    }

    const eatenMeals = mealPlan.response.meal_plan.filter(
      (meal) => meal.isEaten
    );

    const total = eatenMeals.reduce(
      (acc, item) => {
        acc.totalCalories += item.calories || 0;
        acc.totalProtein += item.protein || 0;
        acc.totalCarbohydrates += item.carbohydrates || 0;
        acc.totalFat += item.fat || 0;
        return acc;
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbohydrates: 0,
        totalFat: 0,
      }
    );

    return {
      status: "Success",
      message: "Nutrisi dari makanan yang dimakan",
      summary: total,
    };
  } catch (err) {
    return {
      status: "Failed",
      message: `Catch error: ${err.message}`,
      summary: null,
    };
  }
};
