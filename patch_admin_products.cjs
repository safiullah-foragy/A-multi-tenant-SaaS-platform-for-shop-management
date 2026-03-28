const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/AdminPage.jsx', 'utf-8');

const productListAdmin = `
const ProductListAdmin = ({ api }) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    loadProducts();
  }, []);
  const loadProducts = async () => {
    try {
      const { data } = await api.get("/api/inventory/products");
      setProducts(data.products);
    } catch (err) { }
  };
  const toggleEditPermission = async (product) => {
    try {
      await api.patch(\`/api/inventory/products/\${product._id}\`, { editingPermission: !product.editingPermission });
      loadProducts();
    } catch (err) {
      alert("Failed to update product permission");
    }
  };
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Created</th>
          <th>Editing Permission</th>
        </tr>
      </thead>
      <tbody>
        {products.length === 0 ? <tr><td colSpan="4">No products found.</td></tr> : 
          products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.size || 'N/A'}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td>
                <label className="toggle-switch">
                  <input type="checkbox" checked={p.editingPermission} onChange={() => toggleEditPermission(p)} />
                  <span className="slider"></span>
                </label>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};
`;

if (!content.includes('const ProductListAdmin =')) {
  content = content.replace('const AdminPage', productListAdmin + '\nconst AdminPage');
}

if (!content.includes('<ProductListAdmin api={api} />')) {
  // Find where BatchListAdmin is used, and append it
  content = content.replace(
    '<BatchListAdmin api={api} />',
    '<BatchListAdmin api={api} />\n          </section>\n          <section className="profile-card" style={{marginTop: "2rem"}}>\n            <h3 className="profile-title">All Products Overview</h3>\n            <ProductListAdmin api={api} />'
  );
}

fs.writeFileSync('frontend/src/pages/AdminPage.jsx', content);
