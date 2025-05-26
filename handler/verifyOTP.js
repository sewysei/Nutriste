import { UserModel } from "../models/users.js";

export const verifyOTP = async (req, res) => {
  const otp = req.body.otp?.toString();
  if (!otp) {
    return res
      .status(400)
      .json({ status: "Failed", message: "OTP tidak boleh kosong!" });
  }

  try {
    const checkUser = await UserModel.findOne({ otp });

    if (!checkUser || checkUser.otp !== otp) {
      return res
        .status(400)
        .json({ status: "Failed", message: `OTP Invalid!` });
    }

    if (checkUser.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ status: "Failed", message: "OTP sudah kadaluwarsa." });
    }

    await checkUser.updateOne({ $set: { otpVerified: true } });

    return res
      .status(200)
      .json({ status: "Success", message: "Verifikasi OTP berhasil!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ status: "Failed", message: "Internal server error" });
  }
};
