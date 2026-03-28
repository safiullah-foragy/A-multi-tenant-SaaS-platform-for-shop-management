const fs = require('fs');

const path = '/run/media/sofi/Study/A-multi-tenant-SaaS-platform-for-shop-management/frontend/src/pages/HomePage.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add isLoadingShops state
content = content.replace('const [searchQuery, setSearchQuery] = useState("");\n  const [showCreateModal, setShowCreateModal] = useState(false);', 'const [searchQuery, setSearchQuery] = useState("");\n  const [showCreateModal, setShowCreateModal] = useState(false);\n  const [isLoadingShops, setIsLoadingShops] = useState(true);');

// Update fetchShops function
const oldFetchShops = `  const fetchShops = async () => {
    const { data } = await api.get("/api/shops");
    setShops(data.shops || []);
  };`;
const newFetchShops = `  const fetchShops = async () => {
    try {
      const { data } = await api.get("/api/shops");
      setShops(data.shops || []);
    } finally {
      setIsLoadingShops(false);
    }
  };`;
content = content.replace(oldFetchShops, newFetchShops);

// Update render logic
const targetRender = `<section className="right-blank-area">
          {shops.length > 0 ? (`;

const newRender = `<section className="right-blank-area">
          {isLoadingShops ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }}>
              Loading shops...
            </div>
          ) : shops.length > 0 ? (`;

content = content.replace(targetRender, newRender);

fs.writeFileSync(path, content);
