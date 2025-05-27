import { NutritionTargetModel } from "../../models/nutritionTarget";

export const nutritionTarget = async (req, res) => {
  try {
    const { calorie, carbohydrate, protein, fat } = req.body;
    const userId = req.userId;

    let checkUser = await NutritionTargetModel.findById({ userId });

    if (checkUser) {
      checkUser.calorie = calorie;
      checkUser.carbohydrate = carbohydrate;
      checkUser.protein = protein;
      checkUser.fat = fat;

      const updatedTarget = await checkUser.save();

      return res.status(200).json({
        status: "Success",
        message: "Target Nutrisi diperbaharui",
        updatedTarget,
      });
    }

    const newTarget = new NutritionTargetModel({
      calorie,
      carbohydrate,
      protein,
      fat,
    });

    const savedTarget = await newTarget.save();

    return res.status(200).json({
      status: "Success",
      message: "Sukses membuat Target Nutrisi",
      savedTarget,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
