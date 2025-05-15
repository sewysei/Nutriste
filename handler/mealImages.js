// controllers/mealImageController.js
import { getImageForFoodBase64 } from "./getMealImage.js";

export const getMealImage = async (req, res) => {
  try {
    const food = req.query.food;
    if (!food) {
      return res.status(400).json({
        status: "Failed",
        message: "Parameter 'food' diperlukan",
      });
    }

    const base64Image = await getImageForFoodBase64(food);
    if (!base64Image) {
      return res.status(404).json({
        status: "Failed",
        message: `Gambar tidak ditemukan untuk makanan: ${food}`,
      });
    }

    res.status(200).json({
      status: "Success",
      food,
      image: base64Image,
    });
  } catch (error) {
    console.error("Error fetching meal image:", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan saat mengambil gambar",
    });
  }
};
