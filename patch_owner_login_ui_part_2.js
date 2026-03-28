const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

// I need to find where the role selection is... Ah it looks like previously in other files or versions there was a role selection loginRole.
// Let's inject a role selection UI at the beginning of the form if loginRole is null.
// Wait, the previous version of the code didn't use `loginRole` at all for the UI originally, but I added state for it. I should ensure it's rendered!

code = code.replace(
  /<h1>\{forgotMode \? "Forgot password" : "Login as owner"\}<\/h1>\n          <p className="sub">\{forgotMode \? "Get OTP on gmail and set a new password" : "Use gmail or phone number with your password"\}<\/p>\n\n          \{\!forgotMode \? \(\n            <form className="stack" onSubmit=\{handleLogin\}>/,
  `{!loginRole ? (
            <div className="role-selection stack" style={{textAlign: 'center', padding: '2rem 0'}}>
              <h1>Welcome to {selectedShop?.shopName || "Shop"}</h1>
              <p className="sub">Please select your login role</p>
              <button type="button" onClick={() => setLoginRole("owner")} className="primary" style={{marginTop: '1rem'}}>
                Login as Owner
              </button>
              <button type="button" onClick={() => setLoginRole("admin")} className="secondary" style={{marginTop: '0.5rem', backgroundColor: '#e2e8f0', color: '#1e293b'}}>
                Login as Admin
              </button>
              <button type="button" onClick={() => setLoginRole("cashier")} className="secondary" style={{marginTop: '0.5rem', backgroundColor: '#e2e8f0', color: '#1e293b'}}>
                Login as Cashier
              </button>
              <button type="button" onClick={() => setLoginRole("stockManager")} className="secondary" style={{marginTop: '0.5rem', backgroundColor: '#e2e8f0', color: '#1e293b'}}>
                Login as Stock Manager
              </button>
              {message && <p className="message">{message}</p>}
              <p className="back-home" style={{marginTop: '1rem'}}><Link to="/">Back to shops</Link></p>
            </div>
          ) : (
            <>
          <h1>{forgotMode ? "Forgot password" : \`Login as \${loginRole}\`}</h1>
          <p className="sub">{forgotMode ? "Get OTP on gmail and set a new password" : "Use gmail or phone number with your password"}</p>

          {!forgotMode ? (
            <form className="stack" onSubmit={handleLogin}>`
);

// We need to close the added `<>` wrapper at the bottom before message
code = code.replace(
  /<\/button>\n\s*<\/>\n\s*\)\}\n\n\s*\{message && <p className="message">\{message\}<\/p>\}\n\s*<p className="back-home">\n\s*<Link to="\/">Back to shops<\/Link>\n\s*<\/p>\n\s*<\/section>/,
  `</button>
            </>
          )}
          
          <button type="button" className="text-link" onClick={() => { setLoginRole(null); setMessage(""); setForgotMode(false); }} style={{marginTop: '1rem'}}>
            Change Role
          </button>
          
          {message && <p className="message">{message}</p>}
          <p className="back-home">
            <Link to="/">Back to shops</Link>
          </p>
          </>
          )}
        </section>`
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
