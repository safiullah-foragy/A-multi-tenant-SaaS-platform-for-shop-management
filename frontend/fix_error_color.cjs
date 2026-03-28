const fs = require('fs');
let css = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', 'utf8');

css = css.replace(/color:\s*#7f1d1d;/g, 'color: #fca5a5;'); // light red for error

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', css);
