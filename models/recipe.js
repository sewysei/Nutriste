import mongoose from "mongoose";
const { Schema } = mongoose;

const mealRecipeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "UserModel" depending on your setup
      required: true,
    },
    recipes: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const mealRecipeModel = mongoose.model("Recipe", mealRecipeSchema);
