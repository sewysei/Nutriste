import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./db.js";
import { upload } from "./uploadFile.js";
import { registerUser } from "./handler/AUTH/register.js";
import { googleSignIn } from "./handler/AUTH/googleRegister.js";
import { googleCallbackLogin } from "./handler/AUTH/googleRegister.js";
import { googlePassword } from "./handler/AUTH/password.js";
import { loginUser } from "./handler/AUTH/login.js";
import { forgotPassword } from "./handler/AUTH/forgotPass.js";
import { resetPassword } from "./handler/AUTH/resetPass.js";
import { addProfile } from "./handler/NUTRITION/profile.js";
import { getProfile } from "./handler/NUTRITION/getProfile.js";
import { getNutritionSuggestion } from "./handler/NUTRITION/getNutrition.js";
import { getTodayNutrition } from "./handler/NUTRITION/todayNutrition.js";
import { getMealPlan } from "./handler/NUTRITION/getMeal.js";
import { getCaloriesInPeriod } from "./handler/NUTRITION/getCalories.js";
import { getFact } from "./handler/NUTRITION/getFact.js";
import { getMealImage } from "./handler/NUTRITION/mealImages.js";
import { getRecipes } from "./handler/NUTRITION/recipes.js";
import { chatBot } from "./handler/CHATBOT/chatbot.js";
import { getChatHistory } from "./handler//CHATBOT/getChatHistory.js";
import { deleteUser } from "./handler/AUTH/deleteAcc.js";
import { logoutUser } from "./handler/AUTH/logout.js";
import { verifyOTP } from "./handler/AUTH/verifyOTP.js";
import { resendOTP } from "./handler/AUTH/sendOTP.js";
import { nutritionTarget } from "./handler/NUTRITION/tracker.js";

const app = express();

const origins = ["http://localhost:3000", "https://nutriste-black.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  const msg = "Hello World";
  res.json({
    msg,
  });
});

app.post("/auth/register", registerUser);

app.get("/auth/google", googleSignIn);

app.get("/auth/google/callback", googleCallbackLogin);

app.post("/auth/password", googlePassword);

app.get("/auth/verify-email", verifyOTP);

app.post("/auth/login", loginUser);

app.post("/auth/forgot-password", forgotPassword);

app.post("/auth/verifyOTP", verifyOTP);

app.post("/auth/resend-otp", resendOTP);

app.post("/auth/reset-password", resetPassword);

app.post("/auth/logout", logoutUser);

app.use("/uploads", express.static("uploads"));

app.post("/profile", upload.single("photo"), addProfile);

app.get("/profile", getProfile);

app.get("/nutrition-today", getTodayNutrition);

app.get("/calories", getCaloriesInPeriod);

app.get("/nutrition", getNutritionSuggestion);

app.get("/meal-plan", getMealPlan);

app.get("/fun-fact", getFact);

app.post("/target-nutrition", nutritionTarget);

app.get("/meal-plan-images", getMealImage);

app.get("/recipes", getRecipes);

app.post("/chat", chatBot);

app.get("/chat", getChatHistory);

app.post("/auth/delete", deleteUser);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

// export const handler = serverless(app);
