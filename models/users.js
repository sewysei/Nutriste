import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true, // Correct way to make title required
    },
    author: String,
    price: {
      type: Number,
      required: true,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model("User", userSchema);
