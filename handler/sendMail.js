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
    subject: "Email Verification",
    html: `<p>Click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>
        <p>This link will expires in 6 hours</p>`,
  });
};
