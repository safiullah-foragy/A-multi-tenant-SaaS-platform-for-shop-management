const fs = require('fs');
const file = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Use regex to locate section 1 and 2
const mainContentObj = content.match(/<main className="home-layout">\s*(<section className="card create-card">[\s\S]*?<\/section>)\s*(<section className="right-blank-area">[\s\S]*?<\/section>)\s*<\/main>/);

if (mainContentObj) {
  const replacement = `<main className="home-layout">\n${mainContentObj[2]}\n\n${mainContentObj[1]}\n      </main>`;
  content = content.replace(mainContentObj[0], replacement);
  fs.writeFileSync(file, content);
  console.log("Sections swapped successfully.");
} else {
  console.log("Could not find sections to swap.");
}
