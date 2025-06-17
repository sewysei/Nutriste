import jwt from "jsonwebtoken";
import { google } from "googleapis";
import dotenv from "dotenv";
import { UserModel } from "../../models/users.js";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID2,
  process.env.GOOGLE_CLIENT_SECRET2,
  "https://nutriste.vercel.app/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
  prompt: "consent", // pastikan refresh_token diberikan
});

export const googleSignIn = (req, res) => {
  res.redirect(authorizationUrl);
};

export const googleCallbackLogin = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      status: "Failed",
      message: "Kode otorisasi Google tidak ditemukan di query params.",
    });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens || !tokens.access_token) {
      return res.status(400).json({
        status: "Failed",
        message: "Gagal mendapatkan access token dari Google",
      });
    }

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.name) {
      return res.status(400).json({
        status: "Failed",
        message: "Data pengguna dari Google tidak lengkap",
        data,
      });
    }

    let user = await UserModel.findOne({ email: data.email });

    if (!user) {
      // Pastikan username unik
      const baseUsername = data.name.replace(/\s+/g, "_").toLowerCase();
      let username = baseUsername;
      let count = 1;

      while (await UserModel.findOne({ username })) {
        username = `${baseUsername}${count++}`;
      }

      user = new UserModel({
        username,
        email: data.email,
        password: "-", // default password atau null
        isGoogleUser: true,
      });

      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    if (user.password === "-") {
      return res.redirect(
        `https://nutriste-black.vercel.app/forgot-password/set-password?token=${token}`
      );
    } else if (!user.isFilled && user.password !== "-") {
      return res.redirect(
        `https://nutriste-black.vercel.app/on-board-form?token=${token}&username=${encodeURIComponent(
          user.username
        )}`
      );
    } else {
      return res.redirect(
        `https://nutriste-black.vercel.app/menu-utama?token=${token}`
      );
    }
  } catch (err) {
    console.error("Error in googleCallbackLogin:", err);
    return res.status(500).json({
      status: "Failed",
      message: `Catch error ${err.message}`,
    });
  }
};
