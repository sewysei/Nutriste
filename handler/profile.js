import { HealthProfileModel } from "../models/healthData.js";
import { NutritionDataModel } from "../models/nutrition.js";
import { MealPlanModel } from "../models/mealPlan.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

export const addProfile = async (req, res) => {
  const { age, gender, height, weight, activity, healthCondition, purposes } =
    req.body;

  if (
    !age ||
    !gender ||
    !height ||
    !weight ||
    !activity ||
    !healthCondition ||
    !purposes
  ) {
    return res.status(400).json({ msg: "Please fill every fields required" });
  }

  try {
    const userId = req.userId;
    const existingProfile = await HealthProfileModel.findOne({ userId });

    if (existingProfile) {
      existingProfile.age = age;
      existingProfile.gender = gender;
      existingProfile.height = height;
      existingProfile.weight = weight;
      existingProfile.activity = activity;
      existingProfile.healthCondition = healthCondition;
      existingProfile.purposes = purposes;

      const updatedProfile = await existingProfile.save();

      return res.status(200).json({
        msg: "Health Profile updated",
        data: {
          age: updatedProfile.age,
          gender: updatedProfile.gender,
          height: updatedProfile.height,
          weight: updatedProfile.weight,
          activity: updatedProfile.activity,
          health: updatedProfile.healthCondition,
          purposes: updatedProfile.purposes,
        },
      });
    }

    const newHealthProfile = new HealthProfileModel({
      age,
      gender,
      height,
      weight,
      activity,
      healthCondition,
      purposes,
      userId, // associate it with a user
    });

    const savedProfile = await newHealthProfile.save();
    healthProfileSchema.pre("save", async function (next) {
      const fieldsToCheck = [
        "age",
        "gender",
        "height",
        "weight",
        "activity",
        "healthCondition",
        "purposes",
      ];

      const shouldRegenerate = fieldsToCheck.some((field) =>
        this.isModified(field)
      );
      if (!shouldRegenerate) return next();

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Meal plan generation
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

        const mealPlanSuggestion = await mealPlanResponse.text();

        await MealPlanModel.findOneAndUpdate(
          { userId: this.userId },
          { userId: this.userId, response: mealPlanSuggestion },
          { upsert: true, new: true }
        );

        // Nutrition suggestion generation
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

    res.status(200).json({
      msg: "Health Profile updated",
      data: {
        age: savedProfile.age,
        gender: Profile.gender,
        height: Profile.height,
        weight: Profile.weight,
        activity: Profile.activity,
        health: Profile.healthCondition,
        purposes: Profile.purposes,
      },
    });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
