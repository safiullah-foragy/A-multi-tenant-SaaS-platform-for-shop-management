const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

code = code.replace(/<p className="sub">\{forgotMode \? "Get OTP on gmail and set a new p\n?assword" : "Use gmail or phone number with your password"\}<\/p>/g,
"<p className=\"sub\">{forgotMode ? \"Get OTP on gmail and set a new password\" : \"Use gmail or phone number with your password\"}</p>");
fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
