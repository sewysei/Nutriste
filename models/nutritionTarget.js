import mongoose from "mongoose";
const { Schema } = mongoose;

const nutritionTargetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "UserModel" depending on your setup
      required: true,
    },
    calorie: {
      type: Number,
      required: true,
    },
    carbohydrate: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    calorieDiff: {
      type: Number,
      required: true,
    },
    carbohydrateDiff: {
      type: Number,
      required: true,
    },
    proteinDiff: {
      type: Number,
      required: true,
    },
    fatDiff: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NutritionTargetModel = mongoose.model(
  "NutritionTarget",
  nutritionTargetSchema
);
