import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();

import { verifyToken } from "./verifyToken.js";

import { connectDB } from "./db.js";

import { UserModel } from "./models/users.js";

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(500).json({
        status: "Failed",
        message: "Username, email, and password are required.",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "Failed",
        message: "Email is already registered.",
      });
    }

    const usedUsername = await UserModel.findOne({ username });
    if (usedUsername) {
      return res.status(400).json({
        status: "Failed",
        message: "Username is already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ username, email, password: hashedPassword });
    const savedUser = await user.save();
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    const sendVerificationEmail = (email, token) => {
      const verificationLink = `https://nutriste.vercel.app/verify-email?token=${token}`;
      return transporter.sendMail({
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Email Verification",
        html: `<p>Click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>
        <p>This link will expires in 6 hours</p>`,
      });
    };

    await sendVerificationEmail(email, token);

    res.status(200).json({
      msg: "Register succesful, please check your email for verification",
      savedUser,
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ msg: "Missing verification token." });
  }

  try {
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
});

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
             <p>This link expires in 1 hour.</p>`,
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
