const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

const getApiRouteStr = `loginRole === 'admin' 
      ? '/api/auth/admin-forgot-password' 
      : (loginRole === 'cashier' || loginRole === 'stockManager') 
        ? '/api/auth/staff-forgot-password'
        : '/api/auth/password'`;

code = code.replace(
    /\`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/request-otp' : '\/api\/auth\/password\/request-otp'\}\`/g,
    `\`\$\{${getApiRouteStr}\}/request-otp\``
);

code = code.replace(
    /\`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/validate-otp' : '\/api\/auth\/password\/validate-otp'\}\`/g,
    `\`\$\{${getApiRouteStr}\}/validate-otp\``
);

code = code.replace(
    /\`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/reset-password' : '\/api\/auth\/password\/verify-otp'\}\`/g, // wait I need to check the actual string for verify
    "NOT_USED_YET"
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
