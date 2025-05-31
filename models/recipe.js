import mongoose from "mongoose";
const { Schema } = mongoose;

const mealRecipeSchema = new Schema(
  {
    recipeId: {
      type: String,
      required: true,
      unique: true,
    },
    recipes: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const mealRecipeModel = mongoose.model("Recipe", mealRecipeSchema);
