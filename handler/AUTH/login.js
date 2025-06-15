import jwt from "jsonwebtoken";
import { UserModel } from "../../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (req, res) => {
  const { input, password } = req.body;
  if (!input) {
    return res.status(400).json({
      status: "Failed",
      message: "Email atau username tidak boleh kosong",
    });
  } else if (!password) {
    return res.status(400).json({
      status: "Failed",
      message: "Password tidak boleh kosong",
    });
  }

  try {
    const checkUser = await UserModel.findOne({
      $or: [{ email: input }, { username: input }],
    });
    if (!checkUser) {
      return res.status(400).json({
        status: "Failed",
        message: "Email, username atau password tidak valid",
      });
    }
    if (!checkUser.isVerified) {
      if (!checkUser.otpVerified) {
        return res.status(401).json({
          status: "Failed",
          message: "Silahkan verifikasi email Anda terlebih dahulu",
        });
      }
    }
    const isMatch = bcrypt.compare(password, checkUser.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Email atau password salah" });
    }
    const token = jwt.sign({ userId: checkUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await checkUser.updateOne({
      $unset: {
        isVerified: true,
        otpVerified: "",
        otp: "",
        otpExpires: "",
      },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // use HTTPS in production
      sameSite: "Strict", // prevent CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: "Success",
      message: "Login berhasil",
      token: token,
      user: {
        username: checkUser.username,
        email: checkUser.email,
        checker: checkUser.isFilled,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
