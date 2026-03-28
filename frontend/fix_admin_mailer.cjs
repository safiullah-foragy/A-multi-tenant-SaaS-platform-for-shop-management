const fs = require('fs');
const p = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/controllers/adminController.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace('import { sendEmail } from "../utils/sendEmail.js";', 'import { sendOtpEmail } from "../utils/sendEmail.js";');

content = content.replace(/await sendEmail\(\{\s*to:\s*owner\.gmail,\s*subject:\s*"OTP for Creating New Admin",\s*html:\s*mailContent\s*\}\);/m, 
`await sendOtpEmail({
    to: owner.gmail,
    otp: otp,
    purpose: "create-admin"
  });`);

fs.writeFileSync(p, content);
