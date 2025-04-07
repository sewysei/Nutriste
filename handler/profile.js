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
