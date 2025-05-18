import { HealthProfileModel } from "../models/healthData.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const checkUser = await HealthProfileModel.findOne({ userId });
    if (!checkUser) {
      return res.status(404).json({
        status: "Failed",
        message:
          "Profil Kesehatan tidak ditemukan. Mohon mengisi data di profil terlebih dahulu.",
      });
    } else {
      res.status(200).json({
        status: "Success",
        msg: "Profil Kesehatan ditemukan.",
        data: {
          age: checkUser.age,
          gender: checkUser.gender,
          height: checkUser.height,
          weight: checkUser.weight,
          activity: checkUser.activity,
          healthCondition: checkUser.healthCondition,
          purposes: checkUser.purposes,
          photo: checkUser.photo || null,
          BMI: checkUser.BMI,
        },
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
};
