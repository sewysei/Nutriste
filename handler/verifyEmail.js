import { UserModel } from "../models/users.js";
import dotenv from "dotenv";
dotenv.config();

export const verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ msg: "Missing verification token." });
  }

  try {
    console.log("Received token:", token);
    console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ msg: "Email already verified. Please log in " });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ msg: "Email successfully verified!" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token." });
  }
};
