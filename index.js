import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();

import { verifyToken } from "./verifyToken.js";
import { connectDB } from "./db.js";
import { UserModel } from "./models/users.js";
import { HealthProfileModel } from "./models/healthData.js";
import { registerUser } from "./handler/register.js";
import { verifyEmail } from "./handler/verifyEmail.js";
import { verifyToken } from "./verifyToken.js";

app.post("/register", registerUser);

app.get("/verify-email", verifyEmail);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required." });
  }
  try {
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }
    if (!checkUser.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please verify your email before logging in." });
    }
    const isMatch = await bcrypt.compare(password, checkUser.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }
    const token = jwt.sign({ userId: checkUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // use HTTPS in production
      sameSite: "Strict", // prevent CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        username: checkUser.username,
        email: checkUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Email is required." });
  }
  try {
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res
        .status(400)
        .json({ msg: "User is not registered. Please register first." });
    }

    const resetToken = jwt.sign(
      { userId: checkUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "6h",
      }
    );
    const resetLink = `https://nutriste.vercel.app/reset-password?token=${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click here to reset your password:
             <a href="${resetLink}">${resetLink}</a></p>
             <p>This link expires in 6 hour.</p>`,
    });
    res.status(200).json({ msg: "Reset password email sent." });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.post("/reset-password", async (req, res) => {
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
});

app.post("/profile", verifyToken, async (req, res) => {
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
    const checkHealthProfile = await HealthProfileModel.findById({ userId });
    if (checkHealthProfile) {
      const updatedProfile = await HealthProfileModel.findOneAndUpdate(
        { userId },
        {
          age,
          gender,
          height,
          weight,
          activity,
          healthCondition,
          purposes,
        },
        { new: true }
      );
      return res.status(200).json({
        msg: "Health Profile updated",
        data: updatedProfile,
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
      msg: "Health Profile saved",
      data: savedProfile,
    });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const checkUser = await HealthProfileModel.findById({ userId });
    if (!checkUser) {
      res.status(404).json({
        msg: "Health Profile not found. Please fill data at your profile first",
      });
    } else {
      res.status(200).json({
        msg: "Health Profile found",
        data: checkUser,
      });
    }
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.status(200).json({ msg: "Logged out successfully" });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

export const handler = serverless(app);
