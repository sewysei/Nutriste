import { HealthProfileModel } from "../../models/healthData.js";
import { UserModel } from "../../models/users.js";
import { checkToken } from "../AUTH/checkToken.js"; // sesuaikan path
import dotenv from "dotenv";
dotenv.config();

export const addProfile = async (req, res) => {
  const {
    age,
    gender,
    height,
    weight,
    activity,
    healthCondition,
    foodRestrictions,
    activeStatus,
    mealsPerDay,
    favouriteFood,
    purposes,
  } = req.body;

  if (
    age === undefined ||
    gender === undefined ||
    height === undefined ||
    weight === undefined ||
    !activity ||
    !healthCondition ||
    !foodRestrictions ||
    !activeStatus ||
    !mealsPerDay ||
    !favouriteFood ||
    !purposes
  ) {
    return res.status(400).json({
      status: "Failed",
      message: "Mohon isi semua kolom yang diperlukan.",
    });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "Failed",
      message: "Tidak ada token dikirim.",
    });
  }
  const token = authHeader.split(" ")[1];
  const { valid, expired, decoded } = checkToken(token);
  if (!valid) {
    return res.status(401).json({
      status: "Failed",
      message: expired ? "Token expired." : "Token invalid.",
    });
  }
  const userId = decoded.userId;
  // Check if userId is present
  if (!userId) {
    return res.status(401).json({
      status: "Failed",
      message: "Akses ditolak.",
    });
  }
  try {
    const BMI = weight / ((height * height) / 10000);

    let photoBase64 = null;
    if (req.file) {
      photoBase64 = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
    }

    const existingProfile = await HealthProfileModel.findOne({ userId });
    const user = await UserModel.findById(userId);

    if (existingProfile) {
      existingProfile.age = age;
      existingProfile.gender = gender;
      existingProfile.height = height;
      existingProfile.weight = weight;
      existingProfile.activity = activity;
      existingProfile.healthCondition = healthCondition;
      existingProfile.foodRestrictions = foodRestrictions;
      existingProfile.activeStatus = activeStatus;
      existingProfile.mealsPerDay = mealsPerDay;
      existingProfile.favouriteFood = favouriteFood;
      existingProfile.purposes = purposes;
      existingProfile.BMI = BMI;

      if (photoBase64) {
        existingProfile.photo = photoBase64;
      }

      await user.updateOne({
        $set: { isFilled: true },
      });

      const updatedProfile = await existingProfile.save();

      return res.status(200).json({
        status: "Success",
        message: "Profil Kesehatan diperbarui.",
        isFilled: user.isFilled,
        data: updatedProfile,
      });
    }

    const newHealthProfile = new HealthProfileModel({
      userId,
      age,
      gender,
      height,
      weight,
      activity,
      healthCondition,
      foodRestrictions,
      activeStatus,
      mealsPerDay,
      favouriteFood,
      purposes,
      photo: photoBase64,
      BMI,
    });
    const savedProfile = await newHealthProfile.save();

    await user.updateOne({
      $set: { isFilled: true },
    });

    res.status(200).json({
      status: "Success",
      message: "Profil Kesehatan berhasil dibuat.",
      isFilled: user.isFilled,
      data: savedProfile,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
