const fs = require('fs');
const file = 'frontend/src/pages/AdminPage.jsx';

let content = fs.readFileSync(file, 'utf8');

const regex = /const BatchListAdmin = \(\{ api \}\) => \{[\s\S]*?^};/m;

const replacement = `const BatchListAdmin = ({ api }) => {
  const [batches, setBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/inventory/batches");
      // Sort batches datewise (newest first)
      const sortedBatches = data.batches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBatches(sortedBatches);
    } catch (err) { }
  };

  const toggleEditPermission = async (batch) => {
    try {
      await api.patch(\`/api/inventory/batches/\${batch._id}\`, { editingPermission: !batch.editingPermission });
      loadBatches();
    } catch (err) {
      alert("Failed to update permission");
    }
  };

  const handleDelete = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await api.delete(\`/api/inventory/batches/\${batchId}\`);
      loadBatches();
    } catch (err) {
      alert("Failed to delete batch");
    }
  };

  const startEdit = (batch) => {
    setEditingId(batch._id);
    setEditForm({
      quantity: batch.quantity,
      mrp: batch.mrp,
      costPrice: batch.costPrice
    });
  };

  const saveEdit = async (batchId) => {
    try {
      await api.patch(\`/api/inventory/batches/\${batchId}\`, {
        quantity: Number(editForm.quantity),
        mrp: Number(editForm.mrp),
        costPrice: Number(editForm.costPrice)
      });
      setEditingId(null);
      loadBatches();
    } catch (err) {
      alert("Failed to update batch");
    }
  };

  return (
    <div className="admin-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Date</th>
            <th>Qty</th>
            <th>Remaining</th>
            <th>MRP</th>
            <th>Cost</th>
            <th>Created By</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? <tr><td colSpan="10">No batches found.</td></tr> : 
            batches.map(b => (
              <tr key={b._id}>
                <td>{b.productId?.name || 'Unknown'}</td>
                <td>{b.productId?.size || 'N/A'}</td>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                
                {editingId === b._id ? (
                  <>
                    <td><input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} style={{width: '60px'}} /></td>
                    <td>{b.remainingQuantity}</td>
                    <td><input type="number" value={editForm.mrp} onChange={e => setEditForm({...editForm, mrp: e.target.value})} style={{width: '60px'}} /></td>
                    <td><input type="number" value={editForm.costPrice} onChange={e => setEditForm({...editForm, costPrice: e.target.value})} style={{width: '60px'}} /></td>
                  </>
                ) : (
                  <>
                    <td>{b.quantity}</td>
                    <td>{b.remainingQuantity}</td>
                    <td>₹{b.mrp}</td>
                    <td>₹{b.costPrice}</td>
                  </>
                )}

                <td>{b.creatorName || "Unknown"}</td>
                
                <td>
                  <button 
                    onClick={() => toggleEditPermission(b)}
                    style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      border: "none", 
                      cursor: "pointer",
                      backgroundColor: b.editingPermission ? "#4caf50" : "#f44336",
                      color: "white"
                    }}
                  >
                    {b.editingPermission ? "Active" : "Inactive"}
                  </button>
                </td>

                <td style={{ display: "flex", gap: "8px" }}>
                  {editingId === b._id ? (
                    <>
                      <button onClick={() => saveEdit(b._id)} style={{ padding: "4px 8px", backgroundColor: "#2196f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "4px 8px", backgroundColor: "#9e9e9e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(b)} style={{ padding: "4px 8px", backgroundColor: "#ff9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => handleDelete(b._id)} style={{ padding: "4px 8px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};`;

if (!regex.test(content)) {
  console.log("Could not find BatchListAdmin component");
} else {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Updated BatchListAdmin component");
}
