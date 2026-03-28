const fs = require('fs');
let css = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', 'utf8');

css = css.replace(/color:\s*#4a5568;/g, 'color: #94a3b8;'); 

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', css);
