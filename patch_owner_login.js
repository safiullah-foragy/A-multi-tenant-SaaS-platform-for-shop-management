const fs = require('fs');
const file = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css';
let content = fs.readFileSync(file, 'utf8');

// Update login page background
content = content.replace(
  /\.owner-login-page \{\s*min-height: 100vh;\s*padding: 24px;\s*background: linear-gradient\(150deg, #fefae0, #f8f9fa\);\s*\}/,
  `.owner-login-page {\n  min-height: 100vh;\n  padding: 40px 32px;\n  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);\n  color: #f1f5f9;\n}`
);

// Switch columns layout exactly like the homepage
content = content.replace(
  /\.owner-layout \{\s*max-width: 1100px;\s*margin: 0 auto;\s*display: grid;\s*grid-template-columns: 360px 1fr;\s*gap: 24px;\s*align-items: start;\s*\}/,
  `.owner-layout {\n  max-width: 1100px;\n  margin: 0 auto;\n  display: grid;\n  grid-template-columns: 1fr 360px;\n  gap: 40px;\n  align-items: start;\n}`
);

// Ensure the floating items match the theme
content = content.replace(
  /\.shop-preview-note \{\s*max-width: 260px;\s*min-height: 170px;\s*padding: 14px;\s*background: #fff5ad;\s*border: 1px solid rgba\(0, 0, 0, 0.14\);\s*box-shadow: 0 10px 20px rgba\(0, 0, 0, 0.12\);\s*transform: rotate\(-0.8deg\);\s*\}/,
  `.shop-preview-note {\n  max-width: 320px;\n  min-height: 200px;\n  padding: 20px;\n  background: linear-gradient(135deg, #8b5cf6, #3b82f6);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);\n  color: #fff;\n  transform: rotate(-0.8deg);\n  border-radius: 8px;\n}`
);

content = content.replace(
  /\.text-link \{\s*background: transparent;\s*color: #005f73;\s*padding: 6px 2px;\s*text-align: left;\s*font-weight: 700;\s*border-radius: 0;\s*\}/,
  `.text-link {\n  background: transparent;\n  color: #38bdf8;\n  padding: 6px 2px;\n  text-align: left;\n  font-weight: 700;\n  border-radius: 0;\n}`
);

content = content.replace(
  /\.back-home a \{\s*color: #005f73;\s*font-weight: 700;\s*text-decoration: none;\s*\}/,
  `.back-home a {\n  color: #c084fc;\n  font-weight: 700;\n  text-decoration: none;\n}`
);

fs.writeFileSync(file, content);
