import mongoose from "mongoose";
const { Schema } = mongoose;

const healthProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // or "UserModel" depending on your setup
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    healthCondition: {
      type: String,
      required: true,
    },
    foodRestrictions: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    activeStatus: {
      type: String,
      required: true,
    },
    mealsPerDay: {
      type: String,
      required: true,
    },
    favouriteFood: {
      type: String,
      required: true,
    },
    purposes: {
      type: String,
      required: true,
    },
    BMI: Number,
    status: String,
    photo: String,
  },
  {
    timestamps: true,
  }
);

export const HealthProfileModel = mongoose.model(
  "HealthProfile",
  healthProfileSchema
);
