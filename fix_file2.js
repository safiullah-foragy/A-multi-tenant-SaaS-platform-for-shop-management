const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

code = code.replace(/api\.post\(`\$\{loginRole === 'admin' \? '\/api\/auth\/admi\r?\nn-forgot-password\/request-otp' : '\/api\/auth\/password\/request-otp'\}\`, \{/g,
"api.post(loginRole === 'admin' ? '/api/auth/admin-forgot-password/request-otp' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password/request-otp' : '/api/auth/password/request-otp'), {");


code = code.replace(/api\.post\(`\$\{loginRole === 'admin' \? '\/api\/auth\/admi\n\?n-forgot-password\/request-otp' : '\/api\/auth\/password\/request-otp'\}\`, \{/g,
"api.post(loginRole === 'admin' ? '/api/auth/admin-forgot-password/request-otp' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password/request-otp' : '/api/auth/password/request-otp'), {");


code = code.replace(/api\.post\(`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\n\/validate-otp' : '\/api\/auth\/password\/validate-otp'\}\`, \{/g,
"api.post(loginRole === 'admin' ? '/api/auth/admin-forgot-password/validate-otp' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password/validate-otp' : '/api/auth/password/validate-otp'), {");


code = code.replace(/api\.post\(`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/reset\n-password' : '\/api\/auth\/password\/verify-otp'\}\`, \{/g,
"api.post(loginRole === 'admin' ? '/api/auth/admin-forgot-password/reset-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password/reset-password' : '/api/auth/password/verify-otp'), {");

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
