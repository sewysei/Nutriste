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
    photo: String,
    BMI: Number,
  },
  {
    timestamps: true,
  }
);

export const HealthProfileModel = mongoose.model(
  "HealthProfile",
  healthProfileSchema
);
