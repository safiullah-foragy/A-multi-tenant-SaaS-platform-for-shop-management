const fs = require('fs');
let css = fs.readFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', 'utf8');

css = css.replace(/input\[type="text"\],\s*input\[type="password"\] \{(.*?)\}/s, 
`input[type="text"],
input[type="password"],
input[type="email"],
input[type="number"],
input[type="tel"] {
  width: 100%;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--ink);
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}`);

css = css.replace(/body \{(.*?)\}/s, 
`body {
  margin: 0;
  font-family: inherit;
  color: var(--ink);
  min-height: 100vh;
  background: var(--bg);
}`);

fs.writeFileSync('/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/styles/app.css', css);
