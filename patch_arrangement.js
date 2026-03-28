const fs = require('fs');
const file = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css';
let content = fs.readFileSync(file, 'utf8');

// Update background
content = content.replace(
  /body \{\s*margin: 0;\s*font-family: "Space Grotesk", sans-serif;\s*color: var\(--ink\);\s*min-height: 100vh;\s*background: [^}]+?\}/,
  `body {\n  margin: 0;\n  font-family: "Space Grotesk", sans-serif;\n  color: var(--ink);\n  min-height: 100vh;\n  background: #f8fafc;\n}`
);

// Update page-shell to have a sleek look
content = content.replace(
  /\.page-shell \{\s*min-height: 100vh;\s*padding: 24px;\s*position: relative;\s*overflow: hidden;\s*\}/,
  `.page-shell {\n  min-height: 100vh;\n  padding: 40px 32px;\n  position: relative;\n  overflow: hidden;\n  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);\n  color: #f1f5f9;\n}`
);

// Update glows
content = content.replace(
  /background: #ca6702;/,
  `background: #3b82f6;`
);
content = content.replace(
  /background: #0a9396;/,
  `background: #8b5cf6;`
);

// Update layout
content = content.replace(
  /\.home-layout \{\s*display: grid;\s*grid-template-columns: 360px 1fr;\s*gap: 28px;\s*max-width: 1200px;\s*margin: 0 auto;\s*align-items: start;\s*\}/,
  `.home-layout {\n  display: grid;\n  grid-template-columns: 1fr 360px;\n  gap: 40px;\n  max-width: 1300px;\n  margin: 0 auto;\n  align-items: start;\n}`
);

// Update card
content = content.replace(
  /\.card \{\s*background: var\(--card\);/,
  `.card {\n  background: rgba(255, 255, 255, 0.1);\n  color: #fff;\n  border: 1px solid rgba(255, 255, 255, 0.2);`
);

content = content.replace(
  /\.sub \{\s*margin-top: 0;\s*color: #334e68;\s*\}/,
  `.sub {\n  margin-top: 0;\n  color: #cbd5e1;\n}`
);

content = content.replace(
  /color: #334e68;/,
  `color: #94a3b8;`
);

content = content.replace(
  /var\(--line\)/g,
  `rgba(255, 255, 255, 0.2)`
);

content = content.replace(
  /background: rgba\(255, 255, 255, 0.8\);/,
  `background: rgba(255, 255, 255, 0.05);\n  color: #fff;`
);

// sticky-notes
content = content.replace(
  /background: #ffe97f;/g,
  `background: linear-gradient(135deg, #38bdf8, #2563eb);\n  color: #fff;`
);
content = content.replace(
  /background: #fff5ad;/g,
  `background: linear-gradient(135deg, #34d399, #059669);\n  color: #fff;`
);
content = content.replace(
  /background: #ffdca8;/g,
  `background: linear-gradient(135deg, #fbbf24, #d97706);\n  color: #fff;`
);

content = content.replace(
  /color: #1a1a2e;/g,
  `color: #ffffff;`
);

content = content.replace(
  /color: #555;/,
  `color: rgba(255, 255, 255, 0.9);`
);
content = content.replace(
  /background: rgba\(0, 0, 0, 0.06\);/,
  `background: rgba(255, 255, 255, 0.2);`
);

content = content.replace(
  /\.shop-sticky-note \.enter-shop \{\s*font-family: [^}]+?\}/,
  `.shop-sticky-note .enter-shop {\n  font-family: "Space Grotesk", sans-serif;\n  font-size: 0.72rem;\n  font-weight: 500;\n  opacity: 0.9;\n  margin-top: auto;\n  color: #fff;\n}`
);

fs.writeFileSync(file, content);
