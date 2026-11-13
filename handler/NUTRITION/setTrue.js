export const setTrue = async (req, res) => {
  try {
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
    const selectedMeal = UserModel.findOne({ userId });
    const index = req.body.index;
    const selectedFood = selectedMeal.response.meal_plan[index];
    selectedFood.isEaten = true;
    await selectedMeal.save();
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: `Catch error: ${err.message}`,
    });
  }
};
