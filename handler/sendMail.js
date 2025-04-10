import nodemailer from "nodemailer";

export const sendVerificationEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const verificationLink = `https://nutriste.vercel.app/verify-email?token=${token}`;
  return transporter.sendMail({
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Email Verifikasi",
    html: `<p>Klik link ini untuk reset password: <a href="${verificationLink}">${verificationLink}</a></p>
         <p>Link akan kadaluarsa dalam 6 jam.</p>`,
  });
};
