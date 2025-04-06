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
        data: updatedProfile,
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
      msg: "Health Profile saved",
      data: savedProfile,
    });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
