const fs = require('fs');

let fileContent = fs.readFileSync('frontend/src/pages/HomePage.jsx', 'utf8');

// Add login states
const statesToAdd = `
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");
`;
fileContent = fileContent.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n' + statesToAdd);

const handleLoginGlobal = `
  const handleGlobalLogin = async (event) => {
    event.preventDefault();
    setLoginMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", loginForm);
      import('../api').then(({ setAuthToken }) => setAuthToken(data.token));
      navigate("/profile");
    } catch (error) {
      setLoginMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
`;

fileContent = fileContent.replace('const handleSignupRequest = async (event) => {', handleLoginGlobal + '\n  const handleSignupRequest = async (event) => {');

// Add button to header and modal to render
const buttonCode = `
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ flex: 1, marginRight: '15px' }}>
                  <input
                    type="text"
                    placeholder="Search by shop name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '1rem',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Login as Owner
                </button>
              </div>
`;

fileContent = fileContent.replace(/<div className="search-container"[^>]*>[\s\S]*?<\/div>/, buttonCode);

const modalCode = `
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
`;

fileContent = fileContent.replace('</main>', '</main>\n' + modalCode);

fs.writeFileSync('frontend/src/pages/HomePage.jsx', fileContent);
console.log("Updated HomePage.jsx");
