import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const aiResponse = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: `Give me nutrition suggestion for people with characteristics such as
        - Age: ${userData.age}
        - Gender: ${userData.gender}
        - Height: ${userData.height} cm
        - Weight: ${userData.weight} kg
        - Health Conditions: ${userData.healthCondition}
        - Goal: ${userData.purposes};
        Keep the answer simple and under 300 words`,
});
