import { HealthProfileModel } from "../models/healthData.js";

export const addProfile = async (req, res) => {
  const { age, gender, height, weight, activity, healthCondition, purposes } =
    req.body;

  if (
    age === undefined ||
    gender === undefined ||
    height === undefined ||
    weight === undefined ||
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
      existingProfile.purposes = purposes;
      existingProfile.BMI = BMI;

      if (photoBase64) {
        existingProfile.photo = photoBase64;
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
          BMI: updatedProfile.BMI,
        },
      });
    }

    const addBMI = ((height * height) / 10000) * weight;
    const newHealthProfile = new HealthProfileModel({
      age,
      gender,
      height,
      weight,
      activity,
      healthCondition,
      purposes,
      userId, // associate it with a user
      photo: photoBase64,
      BMI: addBMI,
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
        BMI: savedProfile.BMI,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};
