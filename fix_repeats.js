const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/HomePage.jsx', 'utf8');

// remove duplicate modal
const lastMainIndex = content.lastIndexOf('</main>');
content = content.substring(0, lastMainIndex + 7) + `
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="card login-card" onClick={e => e.stopPropagation()} style={{ position: 'relative', zIndex: 100, minWidth: '350px' }}>
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h1>Owner Login</h1>
            <p className="sub">Access your studio dashboard</p>
            <form onSubmit={handleGlobalLogin} className="stack">
              <input
                type="text"
                placeholder="Email or Phone"
                value={loginForm.identifier}
                onChange={(e) => setLoginForm((s) => ({ ...s, identifier: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            {loginMessage && <p className="message" style={{ color: '#ff6b6b', marginTop: '10px' }}>{loginMessage}</p>}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
`;

fs.writeFileSync('frontend/src/pages/HomePage.jsx', content);
