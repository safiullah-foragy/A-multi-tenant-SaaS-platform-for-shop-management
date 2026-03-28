const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

code = code.replace(/await api\.post\(`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\n\/reset-password' : '\/api\/auth\/password\/verify-otp'\}\`, \{/g,
"await api.post(loginRole === 'admin' ? '/api/auth/admin-forgot-password/reset-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password/reset-password' : '/api/auth/password/verify-otp'), {");
fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
