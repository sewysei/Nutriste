import mongoose from "mongoose";
const { Schema } = mongoose;

const calorieTrackerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalCal: {
      type: Number,
      default: 0,
    },
    history: [
      {
        date: Date,
        mealPlanId: mongoose.Schema.Types.ObjectId,
        mealPlanUpdatedAt: Date,
        totalCalories: Number,
      },
    ],
  },
  { timestamps: true }
);

export const CalorieTrackerModel = mongoose.model(
  "CalorieTracker",
  calorieTrackerSchema
);
