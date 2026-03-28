const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

// Update handleLogin
code = code.replace(
  /} else if \(loginRole === "admin"\) \{[\s\S]*?navigate\("\/admin-dashboard"\); \/\/ Navigate to admin page\n\s*\}/,
  `} else if (loginRole === "admin" || loginRole === "cashier" || loginRole === "stockManager") {
        const route = loginRole === "admin" ? "/api/auth/admin-login" : "/api/auth/staff-login";
        const resultKey = loginRole === "admin" ? "admin" : "staff";
        
        const { data } = await api.post(route, loginForm);

        if (data[resultKey]?.shopId !== shopId) {
          setAuthToken(null);
          setMessage(\`This account is not a valid \${loginRole} of the selected shop\`);
          return;
        }
        
        if (loginRole !== "admin" && data.role !== loginRole) {
          setAuthToken(null);
          setMessage(\`This account is registered as \${data.role}, not \${loginRole}\`);
          return;
        }

        setAuthToken(data.token);
        localStorage.setItem("userRole", loginRole);
        
        if (loginRole === "admin") navigate("/admin-dashboard");
        else navigate("/profile"); // TODO: redirect staff appropriately
      }`
);

// Update triggerForgotPassword
code = code.replace(
  /if \(loginRole === "admin"\) \{\n\s*setForgotMode\(true\);\n\s*setForgotStep\(1\);\n\s*setMessage\("Please enter your admin gmail\."\);\n\s*return;\n\s*\}/,
  `if (loginRole === "admin" || loginRole === "cashier" || loginRole === "stockManager") {
      setForgotMode(true);
      setForgotStep(1);
      setMessage(\`Please enter your \${loginRole} gmail.\`);
      return;
    }`
);

// We need a helper to dynamically compute the route for forgot password
const routeStr = "loginRole === 'admin' ? '/api/auth/admin-forgot-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password' : '/api/auth/password')";

// Request OTP endpoint mapping
code = code.replace(
  /\`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/request-otp' : '\/api\/auth\/password\/request-otp'\}\`/g,
  `\`\$\{${routeStr}\}/request-otp\``
);

// Validate OTP endpoint mapping
code = code.replace(
  /\`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/validate-otp' : '\/api\/auth\/password\/validate-otp'\}\`/g,
  `\`\$\{${routeStr}\}/validate-otp\``
);

// Verify/Reset Password endpoint mapping
code = code.replace(
  /\`\$\{loginRole === 'admin' \? '\/api\/auth\/admin-forgot-password\/reset-password' : '\/api\/auth\/password\/verify-otp'\}\`/g,
  `\`\$\{${routeStr}\}/\$\{loginRole !== 'owner' && loginRole !== null ? 'reset-password' : 'verify-otp'\}\``
);

// Now update the UI to add the Staff login options
code = code.replace(
  /<button className="secondary" style=\{\{width: '100%'\}\} onClick=\{\(\) => setLoginRole\("admin"\)\}>\n\s*Login as Admin\n\s*<\/button>/,
  `<button className="secondary" style={{width: '100%'}} onClick={() => setLoginRole("admin")}>
              Login as Admin
            </button>
            <button className="secondary" style={{width: '100%'}} onClick={() => setLoginRole("cashier")}>
              Login as Cashier
            </button>
            <button className="secondary" style={{width: '100%'}} onClick={() => setLoginRole("stockManager")}>
              Login as Stock Manager
            </button>`
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
