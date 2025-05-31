import mongoose from "mongoose";
const { Schema } = mongoose;

const mealPlanSchema = new Schema(
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
    isEaten: {
      type: Boolean,
      required: true,
      default: false,
    },
    recipeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MealPlanModel = mongoose.model("MealPlan", mealPlanSchema);
