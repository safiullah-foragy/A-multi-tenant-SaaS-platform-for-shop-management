const fs = require('fs');
const file = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\.selected-shop-panel h2 \{/, // match the start
  `.selected-shop-panel h2 {\n  color: #fff;\n`
);

content = content.replace(
  /\.preview-name \{\s*margin: 0 0 12px;\s*font-family: [^}]+?\}/,
  `.preview-name {\n  margin: 0 0 12px;\n  font-family: "Sora", sans-serif;\n  font-size: 1.25rem;\n  color: #fff;\n}`
);

fs.writeFileSync(file, content);
