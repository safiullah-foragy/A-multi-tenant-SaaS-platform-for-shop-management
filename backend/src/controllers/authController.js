import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import { z } from "zod";
import { env } from "../config/env.js";
import { Owner } from "../models/Owner.js";
import { OtpToken } from "../models/OtpToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import { generateShopId } from "../utils/generateShopId.js";

const signupSchema = z.object({
  phone: z.string().min(6).max(20),
  gmail: z.string().email(),
  shopName: z.string().min(2).max(80),
  password: z.string().min(8).max(100)
});

const verifySignupSchema = z.object({
  gmail: z.string().email(),
  otp: z.string().length(6)
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(8).max(100)
});

const resetRequestSchema = z.object({
  gmail: z.string().email()
});

const resetVerifySchema = z.object({
  gmail: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(100)
});

const validateOtpSchema = z.object({
  gmail: z.string().email(),
  otp: z.string().length(6)
});

const signToken = (ownerId) =>
  jwt.sign({ ownerId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

const zodErrorMessage = (parsed, fallbackMessage) => {
  if (parsed.success) {
    return fallbackMessage;
  }

  const firstIssue = parsed.error.issues?.[0];
  return firstIssue?.message || fallbackMessage;
};

export const requestSignupOtp = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: zodErrorMessage(parsed, "Invalid signup data") });
  }

  const { phone, gmail, shopName, password } = parsed.data;
  const normalizedGmail = gmail.toLowerCase();

  const exists = await Owner.findOne({ gmail: normalizedGmail });
  if (exists) {
    return res.status(409).json({ message: "Gmail already exists" });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const passwordHash = await bcrypt.hash(password, 12);
  const expiresAt = new Date(Date.now() + env.otpExpiresSeconds * 1000);

  await OtpToken.findOneAndUpdate(
    { gmail: normalizedGmail, purpose: "signup" },
    {
      phone,
      gmail: normalizedGmail,
      otpHash,
      expiresAt,
      attempts: 0,
      payload: { phone, gmail: normalizedGmail, shopName, passwordHash }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    await sendOtpEmail({ to: normalizedGmail, otp, purpose: "signup" });
  } catch (error) {
    console.error("Signup OTP email error:", error?.message || error);
    return res.status(502).json({ message: "Failed to send OTP email. Check SMTP configuration." });
  }

  return res.status(200).json({
    message: "OTP sent to email",
    expiresInSeconds: env.otpExpiresSeconds
  });
};

export const verifySignupOtp = async (req, res) => {
  const parsed = verifySignupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: zodErrorMessage(parsed, "Invalid OTP data") });
  }

  const { gmail, otp } = parsed.data;
  const normalizedGmail = gmail.toLowerCase();

  const otpDoc = await OtpToken.findOne({ gmail: normalizedGmail, purpose: "signup" });
  if (!otpDoc) {
    return res.status(404).json({ message: "No OTP request found" });
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    await otpDoc.deleteOne();
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otpDoc.attempts >= env.otpMaxAttempts) {
    await otpDoc.deleteOne();
    return res.status(429).json({ message: "Too many invalid attempts. Request OTP again." });
  }

  const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isOtpValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const exists = await Owner.findOne({ gmail: normalizedGmail });
  if (exists) {
    await otpDoc.deleteOne();
    return res.status(409).json({ message: "Gmail already exists" });
  }

  const { phone, shopName, passwordHash } = otpDoc.payload;

  let shopId = generateShopId();
  while (await Owner.findOne({ shopId })) {
    shopId = generateShopId();
  }

  const owner = await Owner.create({
    phone,
    gmail: normalizedGmail,
    passwordHash,
    shopId,
    shopName: shopName || "My Shop",
    shopLogoPath: "",
    shopLocation: ""
  });

  await otpDoc.deleteOne();

  const token = signToken(owner._id);

  return res.status(201).json({
    message: "Shop owner created successfully",
    token,
    owner: {
      id: owner._id,
      phone: owner.phone,
      gmail: owner.gmail,
      shopId: owner.shopId,
      shopName: owner.shopName,
      shopLogoPath: owner.shopLogoPath,
      shopLocation: owner.shopLocation
    }
  });
};

export const loginOwner = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: zodErrorMessage(parsed, "Invalid login data") });
  }

  const { identifier, password } = parsed.data;
  const isEmail = validator.isEmail(identifier);

  const owner = await Owner.findOne(isEmail ? { gmail: identifier.toLowerCase() } : { phone: identifier });
  if (!owner) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, owner.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(owner._id);

  return res.status(200).json({
    message: "Login successful",
    token,
    owner: {
      id: owner._id,
      phone: owner.phone,
      gmail: owner.gmail,
      shopId: owner.shopId,
      shopName: owner.shopName,
      shopLogoPath: owner.shopLogoPath,
      shopLocation: owner.shopLocation
    }
  });
};

export const requestPasswordResetOtp = async (req, res) => {
  const parsed = resetRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: zodErrorMessage(parsed, "Invalid request") });
  }

  const normalizedGmail = parsed.data.gmail.toLowerCase();
  const owner = await Owner.findOne({ gmail: normalizedGmail });
  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + env.otpExpiresSeconds * 1000);

  await OtpToken.findOneAndUpdate(
    { gmail: normalizedGmail, purpose: "reset-password" },
    {
      phone: owner.phone,
      gmail: normalizedGmail,
      otpHash,
      expiresAt,
      attempts: 0,
      payload: {}
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    await sendOtpEmail({ to: normalizedGmail, otp, purpose: "reset-password" });
  } catch (error) {
    console.error("Reset OTP email error:", error?.message || error);
    return res.status(502).json({ message: "Failed to send OTP email. Check SMTP configuration." });
  }

  return res.status(200).json({
    message: "Password reset OTP sent",
    expiresInSeconds: env.otpExpiresSeconds
  });
};

export const validatePasswordResetOtp = async (req, res) => {
  const parsed = validateOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: zodErrorMessage(parsed, "Invalid request") });
  }

  const { gmail, otp } = parsed.data;
  const normalizedGmail = gmail.toLowerCase();

  const otpDoc = await OtpToken.findOne({ gmail: normalizedGmail, purpose: "reset-password" });
  if (!otpDoc) {
    return res.status(404).json({ message: "No OTP request found" });
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    await otpDoc.deleteOne();
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otpDoc.attempts >= env.otpMaxAttempts) {
    await otpDoc.deleteOne();
    return res.status(429).json({ message: "Too many invalid attempts. Request OTP again." });
  }

  const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isOtpValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  return res.status(200).json({ message: "OTP is valid" });
};

export const verifyPasswordResetOtp = async (req, res) => {
  const parsed = resetVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: zodErrorMessage(parsed, "Invalid request") });
  }

  const { gmail, otp, newPassword } = parsed.data;
  const normalizedGmail = gmail.toLowerCase();

  const otpDoc = await OtpToken.findOne({ gmail: normalizedGmail, purpose: "reset-password" });
  if (!otpDoc) {
    return res.status(404).json({ message: "No OTP request found" });
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    await otpDoc.deleteOne();
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otpDoc.attempts >= env.otpMaxAttempts) {
    await otpDoc.deleteOne();
    return res.status(429).json({ message: "Too many invalid attempts. Request OTP again." });
  }

  const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isOtpValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const owner = await Owner.findOne({ gmail: normalizedGmail });
  if (!owner) {
    await otpDoc.deleteOne();
    return res.status(404).json({ message: "Owner not found" });
  }

  owner.passwordHash = await bcrypt.hash(newPassword, 12);
  await owner.save();
  await otpDoc.deleteOne();

  return res.status(200).json({ message: "Password reset successful" });
};
