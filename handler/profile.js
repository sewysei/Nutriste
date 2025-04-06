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
    return res.status(400).json({ msg: "Please fill every fields required" });
  }

  try {
    const userId = req.userId;
    const checkHealthProfile = await HealthProfileModel.findOne({ userId });
    if (checkHealthProfile) {
      const updatedProfile = await HealthProfileModel.findOneAndUpdate(
        { userId },
        {
          age,
          gender,
          height,
          weight,
          activity,
          healthCondition,
          purposes,
        },
        { new: true }
      );
      return res.status(200).json({
        msg: "Health Profile updated",
        data: {
          age: updatedProfile.age,
          gender: updatedProfile.gender,
          height: updatedProfile.height,
          weight: updatedProfile.weight,
          activity: updatedProfile.activity,
          health: updatedProfile.healthCondition,
          purposes: updatedProfile.purposes,
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
    });

    const savedProfile = await newHealthProfile.save();

    res.status(200).json({
      msg: "Health Profile updated",
      data: {
        age: savedProfile.age,
        gender: savedProfile.gender,
        height: savedProfile.height,
        weight: savedProfile.weight,
        activity: savedProfile.activity,
        health: savedProfile.healthCondition,
        purposes: savedProfile.purposes,
      },
    });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
