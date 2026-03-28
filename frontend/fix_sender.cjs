const fs = require('fs');
const p = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/backend/src/utils/sendEmail.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  'const subject = purpose === "signup" ? "Your Shop Account OTP" : "Your Password Reset OTP";',
  'let subject = "Your OTP";\n  if(purpose === "signup") subject = "Your Shop Account OTP";\n  else if(purpose === "reset-password") subject = "Your Password Reset OTP";\n  else if(purpose === "create-admin") subject = "Authorize New Admin Creation";'
);
fs.writeFileSync(p, content);
