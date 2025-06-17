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
      type: String,
      required: true,
    },
    carbohydrateDiff: {
      type: String,
      required: true,
    },
    proteinDiff: {
      type: String,
      required: true,
    },
    fatDiff: {
      type: String,
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
