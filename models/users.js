import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: { type: String, required: true },
    password: {
      type: String,
    },
    isVerified: { type: Boolean, default: false },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpires: Date,
    otpVerified: Boolean,
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model("User", userSchema);
