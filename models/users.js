import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    isFilled: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },
    otp: { type: String, required: false }, // changed
    otpExpires: { type: Date, required: false }, // changed
    otpVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
