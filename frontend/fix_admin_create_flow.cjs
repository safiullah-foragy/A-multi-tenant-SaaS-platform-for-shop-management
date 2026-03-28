const fs = require('fs');
let content = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js', 'utf8');

content = content.replace(
`// Owner requests OTP to create an admin
export const requestCreateAdminOtp = async (req, res) => {
  const owner = req.owner; // Assumes authRequired middleware

  // Create & send OTP
  const otp = generateOtp(6);
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP for this specific purpose and owner
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

  await sendOtpEmail({
    to: owner.gmail,
    otp: otp,
    purpose: "create-admin"
  });

  res.json({ message: "OTP sent to your email successfully." });
};`, 
`// Request OTP for the ADMIN's email
export const requestCreateAdminOtp = async (req, res) => {
  const { adminGmail } = req.body;
  if (!adminGmail) {
    return res.status(400).json({ message: "Admin gmail is required." });
  }

  // Ensure an admin with this email doesn't already exist
  const existingAdmin = await Admin.findOne({ gmail: adminGmail.toLowerCase().trim() });
  if (existingAdmin) {
    return res.status(400).json({ message: "An admin with this email already exists system-wide." });
  }

  // Create & send OTP
  const otp = generateOtp(6);
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP for this specific purpose and new admin's email
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

  res.json({ message: "OTP sent to the prospective admin's email successfully." });
};`);

content = content.replace(
`  // Verify OTP
  const tokenDoc = await OtpToken.findOne({
    gmail: owner.gmail,
    purpose: "create-admin"
  });`,
`  // Verify OTP against the ADMIN's provided email
  const tokenDoc = await OtpToken.findOne({
    gmail: adminData.gmail.toLowerCase().trim(),
    purpose: "create-admin"
  });`);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js', content);
