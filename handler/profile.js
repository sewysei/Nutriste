import { HealthProfileModel } from "../models/healthData.js";

export const addProfile = async (req, res) => {
  const { age, gender, height, weight, activity, healthCondition, purposes } =
    req.body;

  if (
    !age ||
    !gender ||
    !height ||
    !weight ||
    !activity ||
    !healthCondition ||
    !purposes
  ) {
    return res.status(400).json({
      status: "Failed",
      message: "Mohon isi semua kolom yang diperlukan.",
    });
  }

  try {
    const userId = req.userId;
    const photo = req.file ? req.file.filename : null;
    const existingProfile = await HealthProfileModel.findOne({ userId });

    if (existingProfile) {
      existingProfile.age = age;
      existingProfile.gender = gender;
      existingProfile.height = height;
      existingProfile.weight = weight;
      existingProfile.activity = activity;
      existingProfile.healthCondition = healthCondition;
      existingProfile.purposes = purposes;

      if (photo) {
        existingProfile.photo = photo;
      }

      const updatedProfile = await existingProfile.save();

      return res.status(200).json({
        status: "Success",
        message: "Profil Kesehatan diperbarui.",
        data: {
          age: updatedProfile.age,
          gender: updatedProfile.gender,
          height: updatedProfile.height,
          weight: updatedProfile.weight,
          activity: updatedProfile.activity,
          health: updatedProfile.healthCondition,
          purposes: updatedProfile.purposes,
          photo: updatedProfile.photo || null,
        },
      });
    }

    const newHealthProfile = new HealthProfileModel({
      age,
      gender,
      height,
      weight,
      activity,
      healthCondition,
      purposes,
      userId, // associate it with a user
      photo,
    });

    const savedProfile = await newHealthProfile.save();
    res.status(200).json({
      status: "Success",
      message: "Profil Kesehatan berhasil dibuat.",
      data: {
        age: savedProfile.age,
        gender: savedProfile.gender,
        height: savedProfile.height,
        weight: savedProfile.weight,
        activity: savedProfile.activity,
        health: savedProfile.healthCondition,
        purposes: savedProfile.purposes,
        photo: savedProfile.photo || null,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};
