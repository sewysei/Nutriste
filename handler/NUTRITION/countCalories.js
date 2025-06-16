import { MealPlanModel } from "../../models/mealPlan.js";
import { CalorieTrackerModel } from "../../models/calorieTracker.js";

export const getCalories = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const selectedMealPlan = await MealPlanModel.findOne({ userId });

    if (!selectedMealPlan) {
      console.log("Meal plan tidak ditemukan untuk userId:", userId);
      return;
    }

    const mealPlanId = selectedMealPlan._id;
    const mealPlanUpdatedAt = new Date(selectedMealPlan.updatedAt);

    let calories = 0;
    // Hitung total kalori dari meal plan
    for (const selectedMeal of selectedMealPlan.response.meal_plan) {
      calories += selectedMeal.calories;
    }
    // Cek apakah tracker sudah ada
    let tracker = await CalorieTrackerModel.findOne({ userId });

    if (!tracker) {
      tracker = await CalorieTrackerModel.create({
        userId,
        totalCal: calories,
        history: [
          {
            date: today,
            mealPlanId,
            mealPlanUpdatedAt,
            totalCalories: calories,
          },
        ],
      });
    } else {
      const todayIndex = tracker.history.findIndex(
        (entry) => new Date(entry.date).getTime() === today.getTime()
      );

      if (todayIndex !== -1) {
        const existing = tracker.history[todayIndex];

        const sameMealPlan =
          existing.mealPlanId.toString() === mealPlanId.toString() &&
          new Date(existing.mealPlanUpdatedAt).getTime() ===
            mealPlanUpdatedAt.getTime();

        if (sameMealPlan) return; // Tidak ada perubahan pada meal plan, tidak perlu update

        // Meal plan updated → update entry
        tracker.totalCal -= existing.totalCalories;
        tracker.totalCal += calories;

        tracker.history[todayIndex] = {
          date: today,
          mealPlanId,
          mealPlanUpdatedAt,
          totalCalories: calories,
        };
      } else {
        // Entry baru untuk hari ini
        tracker.totalCal += calories;
        tracker.history.push({
          date: today,
          mealPlanId,
          mealPlanUpdatedAt,
          totalCalories: calories,
        });
      }

      await tracker.save();
    }
  } catch (err) {
    console.error("Error updating calories:", err.message);
  }
};
