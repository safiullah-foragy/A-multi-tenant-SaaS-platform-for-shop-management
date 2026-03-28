const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');
code = code.replace(/\/\/ We might want to store user type, e\.g\r?\n\. localStorage\.setItem\("userRole\r?\n", "owner"\);/g, '// We might want to store user type, e.g. localStorage.setItem("userRole", "owner");');
code = code.replace(/\/\/ We might want to store user type, e\.g\n\. localStorage\.setItem\("userRole\n", "owner"\);/g, '// We might want to store user type, e.g. localStorage.setItem("userRole", "owner");');
code = code.replace(/\/\/ We might want to store user type, e\.g\.\s*localStorage\.setItem\("userRole\n", "owner"\);/g, '');
fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
