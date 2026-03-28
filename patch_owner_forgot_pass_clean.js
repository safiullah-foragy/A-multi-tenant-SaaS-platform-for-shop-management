const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

// Update triggerForgotPassword
code = code.replace(
  /const triggerForgotPassword = async \(\) => \{\n\s*setForgotMode\(true\);\n\s*setMessage\(""\);\n\s*setLoading\(true\);\n\s*if \(\!selectedShop\?\.gmail\) \{/,
  `const triggerForgotPassword = async () => {
    if (loginRole === "admin" || loginRole === "cashier" || loginRole === "stockManager") {
      setForgotMode(true);
      setForgotStep(1);
      setMessage(\`Please enter your \${loginRole} gmail.\`);
      return;
    }

    setForgotMode(true);
    setMessage("");
    setLoading(true);

    if (!selectedShop?.gmail) {`
);

// We need a helper to dynamically compute the route for forgot password
const routeStr = "loginRole === 'admin' ? '/api/auth/admin-forgot-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password' : '/api/auth/password')";

// Request OTP endpoint mapping (trigger)
code = code.replace(
  /const \{ data \} = await api\.post\("\/api\/auth\/password\/request-otp", \{\n\s*gmail: selectedShop\.gmail\n\s*\}\);/,
  `const { data } = await api.post(\`\$\{${routeStr}\}/request-otp\`, {
        gmail: selectedShop.gmail
      });`
);

// Request OTP endpoint mapping (handleRequest)
code = code.replace(
  /const \{ data \} = await api\.post\("\/api\/auth\/password\/request-otp", \{\n\s*gmail: resetForm\.gmail\n\s*\}\);/g,
  `const { data } = await api.post(\`\$\{${routeStr}\}/request-otp\`, {
        gmail: resetForm.gmail
      });`
);

// Validate OTP endpoint mapping
code = code.replace(
  /await api\.post\("\/api\/auth\/password\/validate-otp", \{\n\s*gmail: resetForm\.gmail,\n\s*otp: resetForm\.otp\n\s*\}\);/g,
  `await api.post(\`\$\{${routeStr}\}/validate-otp\`, {
        gmail: resetForm.gmail,
        otp: resetForm.otp
      });`
);

// Verify/Reset Password endpoint mapping
code = code.replace(
  /await api\.post\("\/api\/auth\/password\/verify-otp", \{\n\s*gmail: resetForm\.gmail,\n\s*otp: resetForm\.otp,\n\s*newPassword: resetForm\.newPassword\n\s*\}\);/g,
  `await api.post(\`\$\{${routeStr}\}/\$\{loginRole !== 'owner' && loginRole !== null ? 'reset-password' : 'verify-otp'\}\`, {
        gmail: resetForm.gmail,
        otp: resetForm.otp,
        newPassword: resetForm.newPassword
      });`
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
