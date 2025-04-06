import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res
      .status(400)
      .json({ msg: "Token and new password are required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const checkUser = await UserModel.findById(decoded.userId);

    if (!checkUser) {
      return res.status(404).json({ msg: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    checkUser.password = hashedPassword;
    await checkUser.save();

    res.status(200).json({ msg: "Password reset successful." });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token." });
  }
};
