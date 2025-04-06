import { HealthProfileModel } from "../models/healthData";

const getUserHealthData = async (userId) => {
  const checkUser = await HealthProfileModel.findOne({ userId });

  return checkUser;
};

const checkUserNutritionData = async (userId) => {
  const db = getDatabase();
  const userHealthCollection = db.collection("userNutrition");

  return await userHealthCollection.findOne({ userId });
};

const saveUserNutritionData = async (userId, suggestion) => {
  const db = getDatabase();
  const userNutritionCollection = db.collection("userNutrition");

  const nutritionData = {
    userId,
    suggestion,
    createdAt: new Date(),
  };

  await userNutritionCollection.insertOne(nutritionData);
  return nutritionData;
};

export const getNutritionSuggestion = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user's health data
    const userData = await getUserHealthData(userId);
    if (!userData) {
      return res.status(404).json({
        message:
          "No health data found for this user, please input information in your profile first",
      });
    }

    const existingNutritionData = await checkUserNutritionData(userId);
    if (!existingNutritionData) {
      const suggestion = aiResponse.text;
      const savedData = await saveUserNutritionData(userId, suggestion);

      res
        .status(200)
        .json({ message: "Success Generate new data", suggestion: savedData });
    } else {
      res.status(200).json({
        message: "Success Fetching data from database",
        suggestion: existingNutritionData,
      });
    }
  } catch (error) {
    console.error("Error generating nutrition suggestion", error);
    res.status(500).json({ message: "Failed to generate suggestion" });
  }
};
