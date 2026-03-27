import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  mailFrom: process.env.MAIL_FROM || "",
  otpExpiresSeconds: Number(process.env.OTP_EXPIRES_SECONDS || 3),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5)
};

export const assertEnv = () => {
  const required = ["mongoUri", "jwtSecret", "smtpHost", "smtpUser", "smtpPass", "mailFrom"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
};
