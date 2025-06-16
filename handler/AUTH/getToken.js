import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getToken = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Token tidak ditemukan di cookie",
      });
    }

    // (Opsional) Verifikasi token dulu
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      status: "Success",
      message: "Token ditemukan",
      token, // bisa juga return ini
    });
  } catch (err) {
    return res.status(401).json({
      status: "Failed",
      message: `Token tidak valid: ${err.message}`,
    });
  }
};
