const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

code = code.replace(/<button type="button" onClick=\{\(\) => \{ setLoginRole\("admin"\); se\n?tMessage\(""\); setForgotMode\(false\); \}\} className="secondary-button" style=\{\{back\n?groundColor: '#e2e8f0', color: '#1e293b'\}\}>/g,
"<button type=\"button\" onClick={() => { setLoginRole(\"admin\"); setMessage(\"\"); setForgotMode(false); }} className=\"secondary-button\" style={{backgroundColor: '#e2e8f0', color: '#1e293b'}}>");
fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
