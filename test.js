import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import serverless from "serverless-http";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "../db.js";
import { UserModel } from "../models/users.js";
import { HealthProfileModel } from "../models/healthData.js";
import { registerUser } from "../handler/register.js";
import { verifyEmail } from "../handler/verifyEmail.js";
import { verifyToken } from "../verifyToken.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();

app.post("/register", registerUser);
app.get("/verify-email", verifyEmail);
