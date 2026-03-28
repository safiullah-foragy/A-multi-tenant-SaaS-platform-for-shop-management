const fs = require('fs');
let css = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', 'utf8');

// Update Root Variables for dark theme
css = css.replace(/:root\s*\{[^}]+\}/m, 
`:root {
  --bg: #0f172a;
  --ink: #f8fafc;
  --brand: #3b82f6;
  --brand-2: #10b981;
  --card: rgba(30, 41, 59, 0.85);
  --line: rgba(255, 255, 255, 0.15);
  
  --bg-main: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.85);
  --border-color: rgba(255, 255, 255, 0.15);
}`);

// Update body background
css = css.replace(/body\s*\{[\s\S]*?background:\s*#f8fafc;/, `body {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  color: var(--ink);
  min-height: 100vh;
  background: var(--bg);`);

// For inputs and labels we can make them readable in dark theme
css = css.replace(/input\[type="text"\],[\s\S]*?border:\s*1px solid var\(--line\);/m, 
`input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink);`);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', css);
