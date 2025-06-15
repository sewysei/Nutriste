import { UserModel } from "../../models/users.js";

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      status: "Failed",
      message: "OTP tidak boleh kosong!",
    });
  }

  try {
    const checkUser = await UserModel.findOne({ email });

    if (!checkUser) {
      return res.status(404).json({
        status: "Failed",
        message: `User tidak ditemukan`,
      });
    }

    if (checkUser.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ status: "Failed", message: "OTP sudah kadaluwarsa." });
    }

    await checkUser.updateOne({
      $set: { otpVerified: true },
      $unset: {
        otp: "",
        otpExpires: "",
      },
    });

    return res.status(200).json({
      status: "Success",
      message: "Verifikasi OTP berhasil!",
    });
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
