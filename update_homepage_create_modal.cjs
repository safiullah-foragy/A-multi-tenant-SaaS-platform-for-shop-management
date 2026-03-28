const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/HomePage.jsx', 'utf8');

// Add showCreateModal state
content = content.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n  const [showCreateModal, setShowCreateModal] = useState(false);');

// Inside handleSignupVerify, after successfully creating the shop, close the modal
content = content.replace('setMessage("Shop created successfully");', 'setMessage("Shop created successfully");\n      setShowCreateModal(false);');

// Add "Create Shop" button next to search box
const searchContainerReplacement = `
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
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  + Create a new shop
                </button>
              </div>`;

content = content.replace(/<div className="search-container"[\s\S]*?<\/div>\s*<\/div>/, searchContainerReplacement);

// Turn the "Create Shop" section into a Modal
const createCardRegex = /<section className="card create-card">([\s\S]*?)<\/section>/;
const match = content.match(createCardRegex);
if(match) {
  const innerCardContent = match[1];
  
  const modalWrapper = `
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="card create-card" onClick={e => e.stopPropagation()} style={{ position: 'relative', zIndex: 100, minWidth: '350px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            ${innerCardContent}
          </div>
        </div>
      )}
`;

  // Remove the old section
  content = content.replace(createCardRegex, '');
  
  // Add modal Wrapper right before </main> or </div>
  content = content.replace('</main>', '</main>\n' + modalWrapper);
}

// Since the layout is now just one full width section, we might need to adjust app.css layout or add a button to the empty state as well
// If shops.length === 0, we can add the button there too.
const emptyStateReplacement = `            <div className="empty-shops-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h2>Welcome to ShopSaaS</h2>
              <p style={{ marginBottom: '20px' }}>Create your first shop to get started.</p>
              <button 
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  + Create a new shop
                </button>
            </div>`;

content = content.replace(/<div className="empty-shops-state">[\s\S]*?<\/div>/, emptyStateReplacement);

fs.writeFileSync('frontend/src/pages/HomePage.jsx', content);

// Now change frontend/src/styles/app.css to remove the grid layout from home-layout
let cssContent = fs.readFileSync('frontend/src/styles/app.css', 'utf8');
cssContent = cssContent.replace(/grid-template-columns:\s*1fr\s*360px;/g, 'grid-template-columns: 1fr;');
fs.writeFileSync('frontend/src/styles/app.css', cssContent);

