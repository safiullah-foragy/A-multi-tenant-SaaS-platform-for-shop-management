import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Cashier } from "../models/Cashier.js";
import { StockManager } from "../models/StockManager.js";
import { OtpToken } from "../models/OtpToken.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

// Ensure the request comes from an Admin or Owner
export const requestStaffOtp = async (req, res) => {
  const { user } = req; // user from authRequired middleware
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { staffGmail, role } = req.body;
  if (!staffGmail || !role) {
    return res.status(400).json({ message: "staffGmail and role are required." });
  }

  // Check if email already exists in either
  const existingCashier = await Cashier.findOne({ gmail: staffGmail.toLowerCase() });
  const existingManager = await StockManager.findOne({ gmail: staffGmail.toLowerCase() });
  if (existingCashier || existingManager) {
    return res.status(400).json({ message: "Email already registered as staff." });
  }

  const generatedOtp = crypto.randomInt(100000, 999999).toString();
  const purpose = `create-${role}`;
  const otpHash = await bcrypt.hash(generatedOtp, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await OtpToken.deleteOne({ gmail: staffGmail.toLowerCase(), purpose });
  await OtpToken.create({
    gmail: staffGmail.toLowerCase(),
    otpHash,
    expiresAt,
    purpose
  });

  await sendOtpEmail({ to: staffGmail.toLowerCase(), otp: generatedOtp, purpose });

  res.json({ message: "OTP sent successfully.", success: true });
};

export const verifyAndCreateStaff = async (req, res) => {
  const { user } = req;
  const { otp, staffData, role } = req.body;
  if (!otp || !staffData || !role) {
    return res.status(400).json({ message: "otp, staffData, and role are required." });
  }

  const normalizedGmail = staffData.gmail.toLowerCase();
  const purpose = `create-${role}`;
  const tokenDoc = await OtpToken.findOne({ gmail: normalizedGmail, purpose });
  
  if (!tokenDoc) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const isValidOtp = await bcrypt.compare(otp.toString(), tokenDoc.otpHash);
  if (!isValidOtp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const existingCashier = await Cashier.findOne({ gmail: normalizedGmail });
  const existingManager = await StockManager.findOne({ gmail: normalizedGmail });
  if (existingCashier || existingManager) {
    return res.status(400).json({ message: "Staff already exists with this email." });
  }

  const passwordHash = await bcrypt.hash(staffData.password, 10);
  const shopId = user.shopId;
  const ownerId = user.ownerId || user._id; // If admin, they have ownerId. If owner, their _id is ownerId.

  const staffPayload = {
    name: staffData.name,
    gmail: normalizedGmail,
    phone: staffData.phone,
    address: staffData.address || "",
    time: new Date().toISOString(), // auto inserted by creation time fetch
    gender: staffData.gender || "Prefer not to say",
    age: staffData.age || 0,
    passwordHash,
    isActive: staffData.isActive !== undefined ? staffData.isActive : true,
    shopId,
    ownerId
  };

  let newStaff;
  if (role === "cashier") {
    newStaff = await Cashier.create(staffPayload);
  } else if (role === "stockManager") {
    newStaff = await StockManager.create(staffPayload);
  } else {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  await OtpToken.deleteOne({ _id: tokenDoc._id });

  res.json({ message: `${role} created successfully.`, staff: { id: newStaff._id, name: newStaff.name, email: newStaff.gmail, role } });
};

export const listStaff = async (req, res) => {
  const { user } = req;
  const shopId = user.shopId;
  
  const cashiers = await Cashier.find({ shopId }).select("-passwordHash");
  const stockManagers = await StockManager.find({ shopId }).select("-passwordHash");
  
  res.json({ cashiers, stockManagers });
};

export const toggleStaffStatus = async (req, res) => {
  const { staffId } = req.params;
  const { isActive, role } = req.body;
  if (typeof isActive !== "boolean" || !role) {
    return res.status(400).json({ message: "isActive (boolean) and role are required." });
  }

  let updatedStaff;
  if (role === "cashier") {
    updatedStaff = await Cashier.findByIdAndUpdate(staffId, { isActive }, { new: true });
  } else if (role === "stockManager") {
    updatedStaff = await StockManager.findByIdAndUpdate(staffId, { isActive }, { new: true });
  }

  if (!updatedStaff) {
    return res.status(404).json({ message: "Staff not found" });
  }

  res.json({ message: "Status updated successfully", staff: updatedStaff });
};

export const deleteStaff = async (req, res) => {
  const { staffId } = req.params;
  const { role } = req.query; // e.g. ?role=cashier

  if (!role) {
    return res.status(400).json({ message: "Role is required as a query parameter." });
  }

  let deletedStaff;
  if (role === "cashier") {
    deletedStaff = await Cashier.findByIdAndDelete(staffId);
  } else if (role === "stockManager") {
    deletedStaff = await StockManager.findByIdAndDelete(staffId);
  } else {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  if (!deletedStaff) {
    return res.status(404).json({ message: "Staff not found." });
  }

  res.json({ message: `${role} deleted successfully.` });
};
