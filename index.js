import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./db.js";
import { verifyToken } from "./verifyToken.js";
import { verifyOtpCookie } from "./verifyOTP.js";
import { upload } from "./uploadFile.js";
import { registerUser } from "./handler/AUTH/register.js";
import { googleSignIn } from "./handler/AUTH/googleRegister.js";
import { googlePassword } from "./handler/AUTH/password.js";
import { verifyEmail } from "./handler/AUTH/verifyEmail.js";
import { loginUser } from "./handler/AUTH/login.js";
import { forgotPassword } from "./handler/AUTH/forgotPass.js";
import { resetPassword } from "./handler/AUTH/resetPass.js";
import { addProfile } from "./handler/NUTRITION/profile.js";
import { getProfile } from "./handler/NUTRITION/getProfile.js";
import { getNutritionSuggestion } from "./handler/NUTRITION/getNutrition.js";
import { getMealPlan } from "./handler/NUTRITION/getMeal.js";
import { getMealImage } from "./handler/NUTRITION/mealImages.js";
import { chatBot } from "./handler/CHATBOT/chatbot.js";
import { getChatHistory } from "./handler//CHATBOT/getChatHistory.js";
import { logoutUser } from "./handler/AUTH/logout.js";
import { verifyOTP } from "./handler/AUTH/verifyOTP.js";

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

app.post("/auth/password", verifyToken, googlePassword); // Fix googlePassword handler

app.get("/auth/verify-email", verifyEmail);

app.post("/auth/login", loginUser);

app.post("/auth/forgot-password", forgotPassword);

app.post("/auth/verifyOTP", verifyOTP);

app.post("/auth/reset-password", verifyOtpCookie, resetPassword);

app.use("/uploads", express.static("uploads"));

app.post("/profile", verifyToken, upload.single("photo"), addProfile);

app.get("/profile", verifyToken, getProfile);

app.get("/nutrition", verifyToken, getNutritionSuggestion);

app.get("/meal-plan", verifyToken, getMealPlan);

app.get("/meal-plan-images", verifyToken, getMealImage);

app.post("/chat", verifyToken, chatBot);

app.get("/chat", verifyToken, getChatHistory);

app.post("/auth/logout", logoutUser);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

// export const handler = serverless(app);
