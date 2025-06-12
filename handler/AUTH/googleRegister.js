import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import dotenv from "dotenv";
import { UserModel } from "../../models/users.js";
dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID2,
  process.env.GOOGLE_CLIENT_SECRET2,
  "https://nutriste.vercel.app/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

export const googleSignIn = (req, res) => {
  res.redirect(authorizationUrl);
};

export const googleCallbackLogin = async (req, res) => {
  const { code } = req.query;

  const { tokens } = await client.getToken(code.toString());

  client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: client,
    version: "v2",
  });

  const { data } = await oauth2.userInfo.get();

  if (!data.email || !data.name) {
    return res.status(400).json({
      data: data,
    });
  }

  let user = await UserModel.findOne({ email: data.email });

  if (!user) {
    user = new UserModel({
      username: data.name,
      email: data.email,
      password: "-", // atau null
      isGoogleUser: true,
    });
    await user.save();
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // use HTTPS in production
    sameSite: "Strict", // prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // res.redirect(`https://nutriste.vercel.app/auth-success?token=${tokens}`);

  res.status(200).json({
    status: "Success",
    message: "Login berhasil",
    token: token,
    user: {
      username: data.name,
      email: data.email,
    },
  });
};

// export const googleSignIn = async (req, res) => {
//   const { token } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, sub: googleId } = payload;

//     let user = await UserModel.findOne({ email });

//     if (user && !user.isGoogleUser) {
//       return res.status(400).json({
//         status: "Failed",
//         message:
//           "Email sudah terdaftar dengan metode lain. Silakan login secara manual.",
//       });
//     }
//     if (!user) {
//       // User belum ada, daftarkan
//       let usernameBase = name
//         ? name.replace(/\s+/g, "_").toLowerCase()
//         : "googleuser";
//       let username = usernameBase;
//       let count = 1;

//       while (await UserModel.findOne({ username })) {
//         username = `${usernameBase}${count}`;
//         count++;
//       }

//       user = new UserModel({
//         username,
//         email,
//         password: null, // kosong karena pakai Google
//         isGoogleUser: true, // opsional
//       });
//       await user.save();
//     }

//     const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.cookie("token", jwtToken, {
//       httpOnly: true,
//       secure: true, // use HTTPS in production
//       sameSite: "Strict", // prevent CSRF
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     res.status(200).json({
//       status: "Success",
//       message: "Login dengan Google berhasil",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         token: jwtToken,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "Failed",
//       message: `Catch error ${err.message}`,
//     });
//   }
// };
