import { NutritionTargetModel } from "../../models/nutritionTarget.js";
import { MealPlanModel } from "../../models/mealPlan.js";

export const nutritionTarget = async (req, res) => {
  try {
    const { calorie, carbohydrate, protein, fat } = req.body;
    const userId = req.userId;
    const selectedMealPlan = await MealPlanModel.findOne({ userId });
    let checkUser = await NutritionTargetModel.findOne({ userId });

    if (!selectedMealPlan) {
      const begCal = 0;
      const begCarb = 0;
      const begProtein = 0;
      const begFat = 0;

      if (!checkUser) {
        checkUser = new NutritionTargetModel({
          userId,
          calorie,
          carbohydrate,
          protein,
          fat,
          calorieDiff: begCal,
          carbohydrateDiff: begCarb,
          proteinDiff: begProtein,
          fatDiff: begFat,
        });
      } else {
        checkUser.calorie = calorie;
        checkUser.carbohydrate = carbohydrate;
        checkUser.protein = protein;
        checkUser.fat = fat;
        checkUser.calorieDiff = begCal;
        checkUser.carbohydrateDiff = begCarb;
        checkUser.proteinDiff = begProtein;
        checkUser.fatDiff = begFat;
      }
      const savedTarget = await checkUser.save();
      return res.status(200).json({
        status: "Success",
        message: "Sukses membuat Target Nutrisi",
        savedTarget,
      });
    } else {
      let calories = 0;
      let carbohydrates = 0;
      let proteins = 0;
      let fats = 0;
      for (const selectedMeal of selectedMealPlan.response.meal_plan) {
        calories += selectedMeal.calories;
        carbohydrates += selectedMeal.carbohydrates;
        proteins += selectedMeal.protein;
        fats += selectedMeal.fat;
      }
      if (checkUser) {
        checkUser.calorie = calorie;
        checkUser.carbohydrate = carbohydrate;
        checkUser.protein = protein;
        checkUser.fat = fat;
        checkUser.calorieDiff = calorie - calories;
        checkUser.carbohydrateDiff = carbohydrate - carbohydrates;
        checkUser.proteinDiff = protein - proteins;
        checkUser.fatDiff = fat - fats;

        const updatedTarget = await checkUser.save();

        return res.status(200).json({
          status: "Success",
          message: "Target Nutrisi diperbarui",
          updatedTarget,
        });
      } else {
        const newTarget = new NutritionTargetModel({
          userId,
          calorie,
          carbohydrate,
          protein,
          fat,
          calorieDiff: calorie - calories,
          carbohydrateDiff: carbohydrate - carbohydrates,
          proteinDiff: protein - proteins,
          fatDiff: fat - fats,
        });
        const savedTarget = await newTarget.save();
        return res.status(200).json({
          status: "Success",
          message: "Sukses membuat Target Nutrisi Baru",
          savedTarget,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
