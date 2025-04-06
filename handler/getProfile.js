import { HealthProfileModel } from "../models/healthData.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const checkUser = await HealthProfileModel.findOne({ userId });
    if (!checkUser) {
      res.status(404).json({
        msg: "Health Profile not found. Please fill data at your profile first",
      });
    } else {
      res.status(200).json({
        msg: "Health Profile found",
        data: checkUser,
      });
    }
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
