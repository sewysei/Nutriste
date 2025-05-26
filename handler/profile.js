import { HealthProfileModel } from "../models/healthData.js";

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

  try {
    const userId = req.userId;
    const BMI = weight / ((height * height) / 10000);

    let photoBase64 = null;
    if (req.file) {
      photoBase64 = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
    }

    const existingProfile = await HealthProfileModel.findOne({ userId });

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

      const updatedProfile = await existingProfile.save();

      return res.status(200).json({
        status: "Success",
        message: "Profil Kesehatan diperbarui.",
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
    res.status(200).json({
      status: "Success",
      message: "Profil Kesehatan berhasil dibuat.",
      data: savedProfile,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};
