import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

export const sendOtpEmail = async ({ to, otp, purpose }) => {
  const subject = purpose === "signup" ? "Your Shop Account OTP" : "Your Password Reset OTP";
  const text = `Your OTP is ${otp}. It will expire in ${env.otpExpiresSeconds} seconds.`;

  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text
  });
};
