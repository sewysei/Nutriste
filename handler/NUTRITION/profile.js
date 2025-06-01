import { HealthProfileModel } from "../../models/healthData.js";

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

    let photoUrl = null;
    if (req.file) {
      photoUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
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

      if (photoUrl) {
        existingProfile.photo = photoUrl;
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
      photo: photoUrl,
      BMI,
    });

    const savedProfile = await newHealthProfile.save();
    res.status(200).json({
      status: "Success",
      message: "Profil Kesehatan berhasil dibuat.",
      data: savedProfile,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
