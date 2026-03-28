const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

code = code.replace(
  /if \(loginRole === "admin"\) navigate\("\/admin-dashboard"\);\n\s*else navigate\("\/profile"\); \/\/ Staff views use profile typically\? \(or generic view, let's keep it generic\)/,
  `if (loginRole === "admin") navigate("/admin-dashboard");\n        else if (loginRole === "stockManager") navigate("/stock-manager");\n        else navigate("/profile");`
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
