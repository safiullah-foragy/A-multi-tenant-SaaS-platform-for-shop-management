const fs = require('fs');
const file = 'frontend/src/pages/AdminPage.jsx';

let content = fs.readFileSync(file, 'utf8');

const anchorRegex = /const BatchListAdmin = \(\{ api \}\) => \{[\s\S]*?^};/m;

const replacement = `const BatchListAdmin = ({ api }) => {
  const [batches, setBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const { data } = await api.get("/api/inventory/batches");
      setBatches(data.batches);
    } catch (err) { }
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
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

  const groupedBatches = batches.reduce((acc, batch) => {
    const d = new Date(batch.createdAt).toLocaleDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(batch);
    return acc;
  }, {});

  return (
    <div className="admin-table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
      {Object.keys(groupedBatches).length === 0 ? (
        <p style={{padding: '1rem'}}>No batches found.</p>
      ) : (
        <div className="stack">
          {Object.keys(groupedBatches).sort((a,b) => new Date(b) - new Date(a)).map(date => (
            <div key={date} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem'}}>
              <div 
                onClick={() => toggleDate(date)} 
                style={{padding: '1rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between'}}
              >
                <strong>{date}</strong>
                <span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>
              </div>
              
              {expandedDates[date] && (
                <div style={{padding: '1rem', overflowX: 'auto'}}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Size</th>
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
                      {groupedBatches[date].map(b => (
                        <tr key={b._id}>
                          <td>{b.productId?.name || 'Unknown'}</td>
                          <td>{b.productId?.size || 'N/A'}</td>
                          
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};`;

if (!anchorRegex.test(content)) {
  console.log("Could not match the regex");
} else {
  content = content.replace(anchorRegex, replacement);
  fs.writeFileSync(file, content, 'utf8');
}

