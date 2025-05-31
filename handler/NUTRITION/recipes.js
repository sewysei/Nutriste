import { mealRecipeModel } from "../../models/recipe";
import { MealPlanModel } from "../../models/mealPlan";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getRecipes = async (req, res) => {
  try {
    const userId = req.userId;
    const checkMealPlan = await MealPlanModel.findOne({ userId });
    if (!checkMealPlan) {
      return res.status(404).json({
        status: "Failed",
        message: "Meal plan not found",
      });
    }
    const recipeId = checkMealPlan.recipeId;
    let checkMealRecipe = await mealRecipeModel.findOne({ recipeId });

    if (checkMealRecipe) {
      if (checkMealRecipe.updatedAt < checkMealPlan.updatedAt) {
        const updateMealRecipe = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Berikan saya resep makanan dari setiap makanan yang ada di ${checkMealPlan.response}
          Tulis hasil dalam format JSON.
          JSON harus berisi array dengan nama "foods", dan setiap elemen adalah sebuah objek resep dengan properti:
          - bahan (dalam bentuk objek yang membagi bahan agar terlist)
          - food (nama makanan atau menu)
          - cara pembuatan (dalam bentuk objek yang membagi setiap step pembuatan agar terlist)
          Jangan gunakan tanda cetak tebal, bintang, atau frasa pembuka seperti "Tentu" atau "Berikut adalah". Jawaban hanya JSON.
          Jangan gunakan backtick, tanda kutip tiga, atau format markdown lainnya.`, // keep same prompt
        });

        const mealRecipeText = updateMealRecipe.text;
        const cleanedText = mealRecipeText.replace(/```json|```/g, "").trim();
        const mealRecipeJSON = JSON.parse(cleanedText);

        await mealRecipeModel.updateOne(
          { recipeId },
          {
            $set: {
              recipes: mealRecipeJSON,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
        return res.status(200).json({
          status: "Success",
          message: "Update resep baru",
          recipe: mealRecipeJSON,
        });
      } else {
        return res.status(200).json({
          status: "Success",
          message: "Fetch resep dari database",
          recipe: checkMealRecipe.recipes,
        });
      }
    } else {
      const updateMealRecipe = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Berikan saya resep makanan dari setiap makanan yang ada di ${JSON.stringify(
          checkMealPlan.response
        )}
        Tulis hasil dalam format JSON.
        JSON harus berisi array dengan nama "foods", dan setiap elemen adalah sebuah objek resep dengan properti:
        - bahan (dalam bentuk objek yang membagi bahan agar terlist)
        - food (nama makanan atau menu)
        - cara pembuatan (dalam bentuk objek yang membagi setiap step pembuatan agar terlist)
        Jangan gunakan tanda cetak tebal, bintang, atau frasa pembuka seperti "Tentu" atau "Berikut adalah". Jawaban hanya JSON.
        Jangan gunakan backtick, tanda kutip tiga, atau format markdown lainnya.`, // keep same prompt
      });

      const mealRecipeText = updateMealRecipe.text;
      const cleanedText = mealRecipeText.replace(/```json|```/g, "").trim();
      const mealRecipeJSON = JSON.parse(cleanedText);

      await mealRecipeModel.updateOne(
        { recipeId },
        {
          $set: {
            recipes: mealRecipeJSON,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      return res.status(200).json({
        status: "Success",
        message: "Membuat resep baru",
        recipe: mealRecipeJSON,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
