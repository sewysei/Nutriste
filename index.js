import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./db.js";
import { verifyToken } from "./verifyToken.js";
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
app.use(cookieParser());

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

app.post("/auth/password", verifyToken, googlePassword);

app.get("/auth/verify-email", verifyOTP);

app.post("/auth/login", loginUser);

app.post("/auth/forgot-password", forgotPassword);

app.post("/auth/verifyOTP", verifyOTP);

app.post("/auth/resend-otp", resendOTP);

app.post("/auth/reset-password", resetPassword);

app.post("/auth/logout", logoutUser);

app.use("/uploads", express.static("uploads"));

app.post("/profile", verifyToken, upload.single("photo"), addProfile);

app.get("/profile", verifyToken, getProfile);

app.get("/calories", verifyToken, getCaloriesInPeriod);

app.get("/nutrition", verifyToken, getNutritionSuggestion);

app.get("/meal-plan", verifyToken, getMealPlan);

app.get("/fun-fact", getFact);

app.get("/meal-plan-images", verifyToken, getMealImage);

app.get("/recipes", verifyToken, getRecipes);

app.post("/chat", verifyToken, chatBot);

app.get("/chat", verifyToken, getChatHistory);

app.post("/auth/delete", deleteUser);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

// export const handler = serverless(app);
