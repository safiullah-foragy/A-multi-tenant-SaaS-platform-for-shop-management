const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/OwnerLoginPage.jsx', 'utf8');

const oldStr = `<div className="role-selection stack" style={{textAlign: 'center', padding: '2rem 0'}}>
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
            </div>`;

const newStr = `<div className="role-selection" style={{textAlign: 'center', padding: '1rem 0'}}>
              <h1 style={{fontSize: '1.75rem', marginBottom: '0.5rem'}}>Welcome to {selectedShop?.shopName || "Shop"}</h1>
              <p className="sub" style={{marginBottom: '2rem'}}>Please select your login role to continue</p>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '260px', margin: '0 auto'}}>
                <button type="button" onClick={() => setLoginRole("owner")} className="primary">
                  Owner
                </button>
                <button type="button" onClick={() => setLoginRole("admin")} className="secondary" style={{backgroundColor: '#334155', color: '#f8fafc', borderColor: '#475569', padding: '0.6rem'}}>
                  Admin
                </button>
                <button type="button" onClick={() => setLoginRole("cashier")} className="secondary" style={{backgroundColor: '#334155', color: '#f8fafc', borderColor: '#475569', padding: '0.6rem'}}>
                  Cashier
                </button>
                <button type="button" onClick={() => setLoginRole("stockManager")} className="secondary" style={{backgroundColor: '#334155', color: '#f8fafc', borderColor: '#475569', padding: '0.6rem'}}>
                  Stock Manager
                </button>
              </div>

              {message && <p className="message" style={{marginTop: '2rem'}}>{message}</p>}
              <p className="back-home" style={{marginTop: '2rem'}}>
                <Link to="/">← Back to shops</Link>
              </p>
            </div>`;

// Simple string replacement
code = code.replace(oldStr, newStr);

// I will also improve the form button so it isn't massive either if it's currently 100%
code = code.replace(
  /<button type="submit" disabled=\{loading\}>\n\s*\{loading \? "Signing in\.\.\." : "Login"\}\n\s*<\/button>/,
  '<button type="submit" disabled={loading} style={{maxWidth: "260px", margin: "0 auto", width: "100%"}}>\n                {loading ? "Signing in..." : "Login"}\n              </button>'
);

fs.writeFileSync('frontend/src/pages/OwnerLoginPage.jsx', code);
