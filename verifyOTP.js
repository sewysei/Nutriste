import jwt from "jsonwebtoken";

export const verifyOtpCookie = (req, res, next) => {
  const token = req.cookies.otp;
  if (!token) {
    return res
      .status(401)
      .json({ status: "Failed", message: "OTP tidak ditemukan di cookie." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userOTP = decoded.otp;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "Failed", message: "OTP tidak valid atau expired." });
  }
};
