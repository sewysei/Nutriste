import { UserModel } from "../../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      status: "Failed",
      message: "Password baru tidak boleh kosong.",
    });
  }

  if (newPassword != confirmPassword) {
    return res.status(400).json({
      status: "Failed",
      message: "Password tidak cocok",
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      status: "Failed",
      message:
        "Password harus setidaknya 8 karakter dan mengandung setidaknya satu huruf dan satu angka.",
    });
  }

  try {
    const checkUser = await UserModel.findOne({ email });

    if (!checkUser) {
      return res.status(404).json({
        status: "Failed",
        message: "User tidak ditemukan.",
      });
    }

    if (!checkUser.otpVerified) {
      return res.status(400).json({
        status: "Failed",
        message: "Verifikasi OTP terlebih dahulu!",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const isSame = await bcrypt.compare(newPassword, checkUser.password);

    if (isSame) {
      return res.status(400).json({
        status: "Failed",
        message: "Password baru tidak boleh sama dengan password lama.",
      });
    }

    await checkUser.updateOne({
      $set: { password: hashedPassword },
      $unset: {
        otpVerified: "",
      },
    });

    return res.status(200).json({
      status: "Success",
      message: "Reset password berhasil.",
      checkUser,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
