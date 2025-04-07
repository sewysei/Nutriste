import mongoose from "mongoose";
const { Schema } = mongoose;

const healthProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "UserModel" depending on your setup
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    healthCondition: {
      type: String,
      required: true,
    },
    purposes: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

healthProfileSchema.pre("save", async function (next) {
  if (
    !this.isModified("age") &&
    !this.isModified("gender") &&
    !this.isModified("height") &&
    !this.isModified("weight") &&
    !this.isModified("activity") &&
    !this.isModified("healthCondition") &&
    !this.isModified("purposes")
  )
    return next();

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const { NutritionDataModel } = await import("./nutrition.js");
    const { MealPlanModel } = await import("./mealPlan.js");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const mealPlanResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give me meal plan for people with characteristics such as
        - Age: ${this.age}
        - Gender: ${this.gender}
        - Height: ${this.height} cm
        - Weight: ${this.weight} kg
        - Health Conditions: ${this.healthCondition}
        - Goal: ${this.purposes};
        Keep the answer simple and under 300 words.`,
    });

    const mealPlanSuggestion = mealPlanResponse.text;

    await MealPlanModel.findOneAndUpdate(
      { userId: this.userId },
      { userId: this.userId, response: mealPlanSuggestion },
      { upsert: true, new: true }
    );

    const nutritionResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Give me nutrition suggestion for people with characteristics such as
        - Age: ${this.age}
        - Gender: ${this.gender}
        - Height: ${this.height} cm
        - Weight: ${this.weight} kg
        - Health Conditions: ${this.healthCondition}
        - Goal: ${this.purposes};
        Keep the answer simple and under 300 words.`,
    });
    const nutritionSuggestion = await nutritionResponse.text();

    await NutritionDataModel.findOneAndUpdate(
      { userId: this.userId },
      { userId: this.userId, response: nutritionSuggestion },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Meal plan or Nutrition regeneration failed:", error);
  }

  next();
});

export const HealthProfileModel = mongoose.model(
  "HealthProfile",
  healthProfileSchema
);
