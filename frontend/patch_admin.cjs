const fs = require('fs');

// Patch Admin.js
let adminModel = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/models/Admin.js', 'utf8');
if (!adminModel.includes('isActive:')) {
  adminModel = adminModel.replace(
    `ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    }`,
    `ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }`
  );
  fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/models/Admin.js', adminModel);
}

// Patch adminController.js
let adminController = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js', 'utf8');

if (adminController.includes('owner.gmail')) {
  adminController = adminController.replace(
`export const requestCreateAdminOtp = async (req, res) => {
  const owner = req.owner; // Assumes authRequired middleware

  // Create & send OTP`,
`export const requestCreateAdminOtp = async (req, res) => {
  const { adminGmail } = req.body;
  const owner = req.owner; // Assumes authRequired middleware

  if (!adminGmail) return res.status(400).json({ message: "adminGmail is required" });

  const existingAdmin = await Admin.findOne({ gmail: adminGmail.toLowerCase().trim() });
  if (existingAdmin) {
    return res.status(400).json({ message: "An admin with this email already exists." });
  }

  // Create & send OTP`
  );

  adminController = adminController.replace(
`  // Upsert OTP for this specific purpose and owner
  await OtpToken.findOneAndUpdate(
    { gmail: owner.gmail, purpose: "create-admin" },
    {
      purpose: "create-admin",
      gmail: owner.gmail,
      otpHash,
      expiresAt,
      attempts: 0
    },
    { upsert: true, new: true }
  );

  const mailContent = \`
    <h2>Create Admin Request</h2>
    <p>Your OTP to authorize the creation of a new admin for your shop is: <strong>\${otp}</strong></p>
    <p>It will expire in 10 minutes.</p>
  \`;

  await sendOtpEmail({
    to: owner.gmail,
    otp: otp,
    purpose: "create-admin"
  });`,
`  // Upsert OTP for this specific purpose and admin
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
  });`
  );
}

if (!adminController.includes('toggleAdminStatus')) {
  adminController += `
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
`;
}
fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js', adminController);
