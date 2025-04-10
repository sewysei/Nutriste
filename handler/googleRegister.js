import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/users.js";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignIn = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await UserModel.findOne({ email });

    if (!user) {
      // User belum ada, daftarkan
      user = new UserModel({
        username: name.replace(/\s+/g, "_").toLowerCase(),
        email,
        password: null, // kosong karena pakai Google
        isGoogleUser: true, // opsional
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    res.status(200).json({
      status: "Success",
      message: "Login dengan Google berhasil",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: jwtToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "Failed",
      message: error.message,
    });
  }
};
