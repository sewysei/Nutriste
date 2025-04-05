import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

connectDB();

import { connectDB } from "./db.js";

import { BookModel } from "./models/books.js";

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
    const checkUser = UserModel.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please verify your email before logging in." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password." });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
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

app.get("/books", async (req, res) => {
  try {
    const data = await BookModel.find();
    res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const data = await BookModel.findById(req.params.id);

    if (data) {
      return res.status(200).json({
        msg: "Ok",
        data,
      });
    }

    return res.status(404).json({
      msg: "Not Found",
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    const { name, author, price, description } = req.body;
    const { id } = req.params;
    const data = await BookModel.findByIdAndUpdate(
      id,
      {
        name,
        author,
        price,
        description,
      },
      { new: true }
    );
    res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.post("/books", async (req, res) => {
  try {
    const { name, author, price, description } = req.body;
    const book = new BookModel({ name, author, price, description });
    const data = await book.save();
    res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    await BookModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      msg: "Ok",
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
