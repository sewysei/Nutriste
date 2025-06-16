import { CalorieTrackerModel } from "../../models/calorieTracker.js";
import { getCalories } from "./countCalories.js";

export const getCaloriesInPeriod = async (req, res) => {
  const userId = req.userId;
  const days = parseInt(req.query.days) || 7; // Default to 7 days if not specified

  await getCalories(userId);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  fromDate.setHours(0, 0, 0, 0); // normalize to tanggal awal
  try {
    const tracker = await CalorieTrackerModel.findOne({ userId });
    if (!tracker || !tracker.history.length) {
      return res.status(404).json({
        status: "Failed",
        message: "Data kalori tidak ditemukan",
      });
    }

    // Filter riwayat berdasarkan tanggal
    const filteredHistory = tracker.history.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= fromDate;
    });

    const total = filteredHistory.reduce(
      (sum, entry) => sum + entry.totalCalories,
      0
    );

    res.status(200).json({
      status: "Success",
      days,
      totalCalories: total,
      history: filteredHistory,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
