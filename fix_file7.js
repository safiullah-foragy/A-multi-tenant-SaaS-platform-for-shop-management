const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');
code = code.replace(/\n| /g, 'SPACEORNEWLINE').replace(/identifiSPACEORNEWLINEer/g, 'identifier').replace(/SPACEORNEWLINE/g, '\n');
fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
