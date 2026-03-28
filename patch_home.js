const fs = require('fs');
const file = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/HomePage.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\<section className="right-blank-area"\>[\s\S]*?\<\/main\>/;
const replacement = `<section className="right-blank-area">
          {shops.length > 0 ? (
            <>
              <div className="search-container" style={{ marginBottom: '20px' }}>
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

              <div className="sticky-wrap">
                {shops.filter((shop) => (shop.shopName || "My Shop").toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  shops.filter((shop) => (shop.shopName || "My Shop").toLowerCase().includes(searchQuery.toLowerCase())).map((shop) => (
                    <button
                      type="button"
                      className="shop-sticky-note"
                      key={shop.shopId}
                      onClick={() => navigate(\`/shops/\${shop.shopId}/owner-login\`, { state: { shop } })}
                    >
                      <span className="shop-name">{shop.shopName || "My Shop"}</span>
                      <small className="shop-id">#{shop.shopId.slice(-4)}</small>
                      <small className="enter-shop">Enter Studio →</small>
                    </button>
                  ))
                ) : (
                  <div className="empty-shops-state" style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: '#aaa', margin: 0 }}>No shops found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-shops-state">
              <h2>Welcome to ShopSaaS</h2>
              <p>Create your first shop from the left panel to get started.</p>
            </div>
          )}
        </section>
      </main>`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
