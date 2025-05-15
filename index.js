import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./db.js";
import { verifyToken } from "./verifyToken.js";
import { registerUser } from "./handler/register.js";
import { googleSignIn } from "./handler/googleRegister.js";
import { googlePassword } from "./handler/password.js";
import { verifyEmail } from "./handler/verifyEmail.js";
import { loginUser } from "./handler/login.js";
import { forgotPassword } from "./handler/forgotPass.js";
import { resetPassword } from "./handler/resetPass.js";
import { addProfile } from "./handler/profile.js";
import { getProfile } from "./handler/getProfile.js";
import { getNutritionSuggestion } from "./handler/getNutrition.js";
import { getMealPlan } from "./handler/getMeal.js";
import { getMealImage } from "./handler/mealImages.js";
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

app.post("/auth/register", registerUser);

app.post("/auth/google", googleSignIn);

app.post("/auth/password", verifyToken, googlePassword);

app.get("/auth/verify-email", verifyEmail);

app.post("/auth/login", loginUser);

app.post("/auth/forgot-password", forgotPassword);

app.post("/auth/reset-password", resetPassword);

app.post("/profile", verifyToken, addProfile);

app.get("/profile", verifyToken, getProfile);

app.get("/nutrition", verifyToken, getNutritionSuggestion);

app.get("/meal-plan", verifyToken, getMealPlan);

app.get("/meal-plan-images", verifyToken, getMealImage);

app.post("/auth/logout", logoutUser);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

// export const handler = serverless(app);
