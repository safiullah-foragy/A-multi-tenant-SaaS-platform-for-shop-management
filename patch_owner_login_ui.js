const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

// Now update the UI to add the Staff login options
code = code.replace(
  /<button className="secondary" style=\{\{width: '100%'\}\} onClick=\{\(\) => setLoginRole\("admin"\)\}>\n\s*Login as Admin\n\s*<\/button>/g,
  `<button className="secondary" style={{width: '100%'}} onClick={() => setLoginRole("admin")}>
              Login as Admin
            </button>
            <button className="secondary" style={{width: '100%'}} onClick={() => setLoginRole("cashier")}>
              Login as Cashier
            </button>
            <button className="secondary" style={{width: '100%'}} onClick={() => setLoginRole("stockManager")}>
              Login as Stock Manager
            </button>`
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
