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
  let subject = "Your OTP";
  if(purpose === "signup") subject = "Your Shop Account OTP";
  else if(purpose === "reset-password") subject = "Your Password Reset OTP";
  else if(purpose === "create-admin") subject = "Authorize New Admin Creation";
  const text = `Your OTP is ${otp}. It will expire in ${env.otpExpiresSeconds} seconds.`;

  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text
  });
};

export const sendPasswordChangeEmail = async ({ to }) => {
  const subject = "Password Changed Successfully";
  const text = "Your password has been changed successfully";

  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text
  });
};
