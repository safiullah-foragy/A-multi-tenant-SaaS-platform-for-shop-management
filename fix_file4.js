const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

code = code.replace(/<div className="role-selection" style=\{\{textAlign: 'center', displa\n?y: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0'\}\}>/g,
"<div className=\"role-selection\" style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0'}}>");
fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
