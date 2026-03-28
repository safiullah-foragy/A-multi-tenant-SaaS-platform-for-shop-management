import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin.js";
import { OtpToken } from "../models/OtpToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

// Owner requests OTP to create an admin
export const requestCreateAdminOtp = async (req, res) => {
  const { adminGmail } = req.body;
  const owner = req.owner; // Assumes authRequired middleware

  if (!adminGmail) return res.status(400).json({ message: "adminGmail is required" });

  const existingAdmin = await Admin.findOne({ gmail: adminGmail.toLowerCase().trim() });
  if (existingAdmin) {
    return res.status(400).json({ message: "An admin with this email already exists." });
  }

  // Create & send OTP
  const otp = generateOtp(6);
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP for this specific purpose and admin
  await OtpToken.findOneAndUpdate(
    { gmail: adminGmail.toLowerCase().trim(), purpose: "create-admin" },
    {
      purpose: "create-admin",
      gmail: adminGmail.toLowerCase().trim(),
      otpHash,
      expiresAt,
      attempts: 0
    },
    { upsert: true, new: true }
  );

  await sendOtpEmail({
    to: adminGmail.toLowerCase().trim(),
    otp: otp,
    purpose: "create-admin"
  });

  res.json({ message: "OTP sent to your email successfully." });
};

// Owner submits OTP along with new Admin details
export const verifyAndCreateAdmin = async (req, res) => {
  const { otp, adminData } = req.body;
  const owner = req.owner;

  if (!otp || !adminData) {
    return res.status(400).json({ message: "OTP and admin details are required." });
  }

  // Verify OTP against the ADMIN's provided email
  const tokenDoc = await OtpToken.findOne({
    gmail: adminData.gmail.toLowerCase().trim(),
    purpose: "create-admin"
  });

  if (!tokenDoc) {
    return res.status(400).json({ message: "No OTP found or it has expired" });
  }

  if (Date.now() > tokenDoc.expiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isMatch = await bcrypt.compare(otp, tokenDoc.otpHash);
  if (!isMatch) {
    tokenDoc.attempts += 1;
    await tokenDoc.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Create Admin
  const { name, gmail, phone, password, homeAddress, isActive } = adminData;

  const existingAdmin = await Admin.findOne({ gmail });
  if (existingAdmin) {
    return res.status(400).json({ message: "An admin with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newAdmin = new Admin({
    name,
    gmail: gmail.toLowerCase().trim(),
    phone,
    passwordHash,
    homeAddress,
    isActive: isActive !== undefined ? isActive : true,
    shopId: owner.shopId,
    ownerId: owner._id
  });

  await newAdmin.save();

  // Clear OTP
  await OtpToken.deleteOne({ _id: tokenDoc._id });

  res.status(201).json({
    message: "Admin created successfully.",
    admin: {
      _id: newAdmin._id,
      name: newAdmin.name,
      gmail: newAdmin.gmail,
      phone: newAdmin.phone,
      homeAddress: newAdmin.homeAddress,
      createdAt: newAdmin.createdAt
    }
  });
};

// List all admins for this owner's shop
export const listAdmins = async (req, res) => {
  const owner = req.owner;

  const admins = await Admin.find({ ownerId: owner._id })
    .select("-passwordHash") // exclude password hash
    .sort({ createdAt: -1 });

  res.json({ admins });
};
// Toggle Admin active status
export const toggleAdminStatus = async (req, res) => {
  const { adminId } = req.params;
  const { isActive } = req.body;
  const owner = req.owner;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: "isActive boolean is required." });
  }

  const admin = await Admin.findOne({ _id: adminId, ownerId: owner._id });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found." });
  }

  admin.isActive = isActive;
  await admin.save();

  res.json({ message: "Admin status updated successfully.", admin });
};

// Delete Admin
export const deleteAdmin = async (req, res) => {
  const { adminId } = req.params;
  const owner = req.owner;

  const admin = await Admin.findOneAndDelete({ _id: adminId, ownerId: owner._id });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found." });
  }

  res.json({ message: "Admin deleted successfully." });
};
