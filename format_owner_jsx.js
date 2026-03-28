const fs = require('fs');
const file = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/OwnerLoginPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Switch DOM order exactly as generated Layout expects it. 
// Old order: `<section className="card owner-login-card">` THEN `<section className="selected-shop-panel">`
// We need exactly the opposite:

const layoutMatch = content.match(/<main className="owner-layout">\s*(<section className="card owner-login-card">[\s\S]*?<\/section>)\s*(<section className="selected-shop-panel">[\s\S]*?<\/section>)\s*<\/main>/);

if (layoutMatch) {
  const newLayout = `<main className="owner-layout">\n${layoutMatch[2]}\n\n${layoutMatch[1]}\n      </main>`;
  content = content.replace(layoutMatch[0], newLayout);
  fs.writeFileSync(file, content);
  console.log("OwnerLoginPage sections swapped successfully.");
} else {
  console.log("Could not find sections to swap.");
}
