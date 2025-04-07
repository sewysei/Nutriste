import mongoose from "mongoose";
const { Schema } = mongoose;

const mealPLanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "UserModel" depending on your setup
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MealPlanModel = mongoose.model("MealPlan", mealPLanSchema);
