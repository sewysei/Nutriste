import mongoose from "mongoose";
const { Schema } = mongoose;

const nutritionDataSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "UserModel" depending on your setup
      required: true,
    },
    response: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NutritionDataModel = mongoose.model(
  "NutritionData",
  nutritionDataSchema
);
