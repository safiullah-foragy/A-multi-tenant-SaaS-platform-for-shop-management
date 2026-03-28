const fs = require('fs');
let css = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', 'utf8');

// Ensure hover background on admin table is noticeable
css = css.replace(/\.admin-table tr:hover \{\s*background-color: rgba\(0,\s*0,\s*0,\s*0\.02\);\s*\}/, `.admin-table tr:hover {\n  background-color: rgba(255,255,255,0.05);\n}`);

// Add some specific text colors for card text just in case (profile meta)
if (!css.includes('.shop-meta p')) {
    css += `\n.shop-meta p {\n  color: var(--ink);\n}\n`;
}

css = css.replace(/color:\s*#f1f5f9;/, "color: var(--ink);"); // removing hardcoded light color from page-shell
css = css.replace(/background:\s*linear-gradient[^\n]+;/, ""); // remove the dark theme from just page shell to apply globally

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', css);
