import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./db.js";
import { verifyToken } from "./verifyToken.js";
import { registerUser } from "./handler/register.js";
import { verifyEmail } from "./handler/verifyEmail.js";
import { loginUser } from "./handler/login.js";
import { forgotPassword } from "./handler/forgotPass.js";
import { resetPassword } from "./handler/resetPass.js";
import { addProfile } from "./handler/profile.js";
import { getProfile } from "./handler/getProfile.js";
import { getNutritionSuggestion } from "./handler/getNutrition.js";
import { getMealPlan } from "./handler/getMeal.js";
import { logoutUser } from "./handler/logout.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  const msg = "Hello World";
  res.json({
    msg,
  });
});

app.post("/register", registerUser);

app.get("/verify-email", verifyEmail);

app.post("/login", loginUser);

app.post("/forgot-password", forgotPassword);

app.post("/reset-password", resetPassword);

app.post("/profile", verifyToken, addProfile);

app.get("/profile", verifyToken, getProfile);

app.get("/nutrition", verifyToken, getNutritionSuggestion);

app.get("/meal-plan", verifyToken, getMealPlan);

app.post("/logout", logoutUser);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

// export const handler = serverless(app);
