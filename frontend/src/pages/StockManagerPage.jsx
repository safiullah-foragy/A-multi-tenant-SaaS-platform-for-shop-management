import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api";
import "../styles/app.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StockManagerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("batches"); // 'batches' | 'products'
  
  // Data
  const [products, setProducts] = useState([]);
  const [shopName, setShopName] = useState("");
  const [shopLogoPath, setShopLogoPath] = useState("");
  const [batches, setBatches] = useState([]);

  // Forms
  const [productForm, setProductForm] = useState({ name: "", barcode: "", size: "" });
  const [batchForm, setBatchForm] = useState({ productId: "", quantity: "", mrp: "", costPrice: "" });
  const [editBatchForm, setEditBatchForm] = useState({ quantity: "", mrp: "", costPrice: "" });
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editProductForm, setEditProductForm] = useState({ name: "", barcode: "", size: "" });
  const [editingProductId, setEditingProductId] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  
  // Expanded days for batches
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchBatches();
  }, [navigate]);

    const downloadReport = (date, dateBatches) => {
    const doc = new jsPDF();
    const title = `${shopName || "Store"} - Batch Report`;
    const subtitle = `Date: ${date}`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 28);

    const tableColumn = ["Product Name", "Product ID", "Size", "Quantity", "Cost", "MRP", "Created By"];
    const tableRows = [];

    dateBatches.forEach(batch => {
      const batchData = [
        batch.productId?.name || "N/A",
        batch.productId?.barcode || "N/A",
        batch.productId?.size || "N/A",
        batch.quantity,
        batch.costPrice,
        batch.mrp,
        batch.creatorName || "Unknown"
      ];
      tableRows.push(batchData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40] }
    });

    doc.save(`Report_${date.replace(/\//g, '-')}.pdf`);
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/api/inventory/products");
      setProducts(data.products);
    } catch (err) {
      console.error("Failed to load products");
    }
  };

  const fetchBatches = async () => {
    try {
      const { data } = await api.get("/api/inventory/batches");
      setBatches(data.batches);
      if (data.shopName) setShopName(data.shopName);
      if (data.shopLogoPath) setShopLogoPath(data.shopLogoPath);
      if (data.shopLogoPath) setShopLogoPath(data.shopLogoPath);
      if (data.shopName) setShopName(data.shopName);
    } catch (err) {
      console.error("Failed to load batches");
      if (err.response?.status === 401) {
        setAuthToken(null);
        navigate("/");
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/api/inventory/products", productForm);
      setMessage("Product created successfully!");
      setProductForm({ name: "", barcode: "", size: "" });
      fetchProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/api/inventory/batches", {
        productId: batchForm.productId,
        quantity: Number(batchForm.quantity),
        mrp: Number(batchForm.mrp),
        costPrice: Number(batchForm.costPrice)
      });
      setMessage("Batch created successfully!");
      setBatchForm({ productId: "", quantity: "", mrp: "", costPrice: "" });
      setShowCreateBatch(false);
      fetchBatches();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  const startEditBatch = (batch) => {
    if (!batch.editingPermission) {
      alert("You don't have permission to edit this batch. Ask Admin.");
      return;
    }
    setEditingBatchId(batch._id);
    setEditBatchForm({
      quantity: batch.quantity,
      mrp: batch.mrp,
      costPrice: batch.costPrice
    });
  };

  const handleSaveBatchEdit = async (e, batchId) => {
    e.preventDefault();
    try {
      await api.patch(`/api/inventory/batches/${batchId}`, {
        quantity: Number(editBatchForm.quantity),
        mrp: Number(editBatchForm.mrp),
        costPrice: Number(editBatchForm.costPrice)
      });
      setEditingBatchId(null);
      fetchBatches();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit batch");
    }
  };

  const startEditProduct = (product) => {
    if (!product.editingPermission) {
      alert("You don't have permission to edit this product. Ask Admin.");
      return;
    }
    setEditingProductId(product._id);
    setEditProductForm({
      name: product.name,
      barcode: product.barcode,
      size: product.size
    });
  };

  const handleSaveProductEdit = async (e, productId) => {
    e.preventDefault();
    try {
      await api.patch(`/api/inventory/products/${productId}`, {
        name: editProductForm.name,
        barcode: editProductForm.barcode,
        size: editProductForm.size
      });
      setEditingProductId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit product");
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigate("/");
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  // Grouping batches by date
  const groupedBatches = batches.reduce((acc, batch) => {
    const d = new Date(batch.createdAt).toLocaleDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(batch);
    return acc;
  }, {});

  return (
    <div className="page-shell">
      <header className="home-header">
        <h1 style={{margin: 0}}>Stock Manager Dashboard</h1>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button className="text-link" onClick={() => setActiveTab('batches')} style={{fontWeight: activeTab==='batches'?'bold':'normal'}}>Manage Batches</button>
          <button className="text-link" onClick={() => setActiveTab('products')} style={{fontWeight: activeTab==='products'?'bold':'normal'}}>Manage Products</button>
          <button className="primary" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="home-layout" style={{padding: '2rem'}}>
        {activeTab === 'products' && (
          <section className="card" style={{width: '100%', maxWidth: '800px', margin: '0 auto'}}>
            <h2>Products Master List</h2>
            <form onSubmit={handleCreateProduct} className="stack" style={{marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
               <h3>Add New Product</h3>
               <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                 <label style={{flex: 1}}>Product Name
                   <input required type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Sugar 1kg" />
                 </label>
                 <label style={{flex: 1}}>Barcode
                   <input type="text" value={productForm.barcode} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} placeholder="Optional barcode" />
                 </label>
                 <label style={{flex: 1}}>Size
                   <input required type="text" value={productForm.size} onChange={(e) => setProductForm({...productForm, size: e.target.value})} placeholder="e.g. 1kg, 500ml" />
                 </label>
                 <button type="submit" disabled={loading} style={{alignSelf: 'flex-end', height: '42px'}}>Add Product</button>
               </div>
               {message && <p className="message">{message}</p>}
            </form>

            <table className="admin-table">
               <thead><tr><th>Name</th><th>Barcode</th><th>Size</th><th>Created</th><th>Actions</th></tr></thead>
               <tbody>
                 {products.length === 0 ? <tr><td colSpan="5">No products found.</td></tr> : 
                  products.map(p => (
                    <tr key={p._id}>{editingProductId === p._id ? (
                        <>
                          <td><input type="text" style={{width: '100px', padding: '4px'}} value={editProductForm.name} onChange={e => setEditProductForm({...editProductForm, name: e.target.value})} /></td>
                          <td><input type="text" style={{width: '100px', padding: '4px'}} value={editProductForm.barcode} onChange={e => setEditProductForm({...editProductForm, barcode: e.target.value})} /></td>
                          <td><input type="text" style={{width: '80px', padding: '4px'}} value={editProductForm.size} onChange={e => setEditProductForm({...editProductForm, size: e.target.value})} /></td>
                          <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          
                          <td>
                            <button className="primary" onClick={(e) => handleSaveProductEdit(e, p._id)} style={{padding: '4px 8px', fontSize: '0.8rem', marginRight: '4px'}}>Save</button>
                            <button className="secondary" onClick={() => setEditingProductId(null)} style={{padding: '4px 8px', fontSize: '0.8rem'}}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{p.name}</td>
                          <td>{p.barcode || "N/A"}</td>
                          <td>{p.size || "N/A"}</td>
                          <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              onClick={() => startEditProduct(p)} 
                              style={{
                                padding: '4px 8px', 
                                fontSize: '0.8rem',
                                opacity: p.editingPermission ? 1 : 0.5,
                                cursor: p.editingPermission ? 'pointer' : 'not-allowed'
                              }}
                              title={!p.editingPermission ? "You don't have permission" : ""}
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                 }
               </tbody>
            </table>
          </section>
        )}

        {activeTab === 'batches' && (
          <section className="card" style={{width: '100%', maxWidth: '1000px', margin: '0 auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <h2>Stock Batches</h2>
               <button className="primary" onClick={() => setShowCreateBatch(true)}>+ Create Batch (Lot)</button>
            </div>

            {Object.keys(groupedBatches).length === 0 ? (
               <p style={{textAlign: 'center', opacity: 0.7, marginTop: '2rem'}}>No stock batches added yet.</p>
            ) : (
               <div className="stack" style={{marginTop: '2rem'}}>
                 {Object.keys(groupedBatches).sort((a,b) => new Date(b) - new Date(a)).map(date => (
                   <div key={date} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden'}}>
                      <div 
                        onClick={() => toggleDate(date)} 
                        style={{padding: '1rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between'}}
                      >
                        <strong>{date}</strong>
                                                <button 
                          onClick={(e) => { e.stopPropagation(); downloadReport(date, groupedBatches[date]); }} 
                          className="btn-secondary" 
                          style={{fontSize: '0.8rem', padding: '0.2rem 0.6rem'}}
                        >
                          Download Report
                        </button>
                        <span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>
                      </div>
                      
                      {expandedDates[date] && (
                        <div style={{padding: '1rem'}}>
                          <table className="admin-table">
                            <thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Remaining</th><th>MRP</th><th>Cost</th><th>Created By</th><th>Actions</th></tr></thead>
                            <tbody>
                              {groupedBatches[date].map(batch => (
                                <tr key={batch._id}><td>{batch.productId?.name || "Unknown Product"}</td>
                                  <td>{batch.productId?.size || "N/A"}</td>{editingBatchId === batch._id ? (
                                    <>
                                      <td><input type="number" style={{width: '80px', padding: '4px'}} value={editBatchForm.quantity} onChange={e => setEditBatchForm({...editBatchForm, quantity: e.target.value})} /></td>
                                      <td>{batch.remainingQuantity}</td>
                                      <td><input type="number" style={{width: '80px', padding: '4px'}} value={editBatchForm.mrp} onChange={e => setEditBatchForm({...editBatchForm, mrp: e.target.value})} /></td>
                                      <td><input type="number" style={{width: '80px', padding: '4px'}} value={editBatchForm.costPrice} onChange={e => setEditBatchForm({...editBatchForm, costPrice: e.target.value})} /></td>
                                      <td>{batch.creatorName || "Unknown"}</td>
                                      
                                      <td>
                                        <button className="primary" onClick={(e) => handleSaveBatchEdit(e, batch._id)} style={{padding: '4px 8px', fontSize: '0.8rem', marginRight: '4px'}}>Save</button>
                                        <button className="secondary" onClick={() => setEditingBatchId(null)} style={{padding: '4px 8px', fontSize: '0.8rem'}}>Cancel</button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td>{batch.quantity}</td>
                                      <td>{batch.remainingQuantity}</td>
                                      <td>{batch.mrp}</td>
                                      <td>{batch.costPrice}</td>
                                      <td>{batch.creatorName || "Unknown"}</td>
                                      <td>
                                        <button 
                                          onClick={() => startEditBatch(batch)} 
                                          style={{
                                            padding: '4px 8px', 
                                            fontSize: '0.8rem',
                                            opacity: batch.editingPermission ? 1 : 0.5,
                                            cursor: batch.editingPermission ? 'pointer' : 'not-allowed'
                                          }}
                                          title={!batch.editingPermission ? "You don't have permission" : ""}
                                        >
                                          Edit
                                        </button>
                                      </td>
                                    </>
                                  )}
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
          </section>
        )}
      </main>

      {/* CREATE BATCH MODAL */}
      {showCreateBatch && (
        <div className="modal-overlay" onClick={() => setShowCreateBatch(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <h2>Insert Stock Lot</h2>
             <form className="stack admin-form" onSubmit={handleCreateBatch}>
                <label>Select Product
                  <select 
                    required 
                    value={batchForm.productId} 
                    onChange={e => setBatchForm({...batchForm, productId: e.target.value})}
                    style={{width: '100%', padding: '11px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)'}}
                  >
                     <option value="" style={{color: '#000'}}>-- Choose Product --</option>
                     {products.map(p => (
                       <option value={p._id} key={p._id} style={{color: '#000'}}>{p.name} {p.barcode ? `(${p.barcode})` : ''}</option>
                     ))}
                  </select>
                </label>
                {!products.length && <p style={{color: '#ef4444', fontSize: '0.9rem', marginTop: '-10px'}}>No products available! Please add a product first via Manage Products.</p>}
                
                <label>Quantity
                  <input type="number" required min="1" value={batchForm.quantity} onChange={e => setBatchForm({...batchForm, quantity: e.target.value})} />
                </label>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <label style={{flex: 1}}>Cost Price (Total/Unit)
                    <input type="number" required min="0" step="0.01" value={batchForm.costPrice} onChange={e => setBatchForm({...batchForm, costPrice: e.target.value})} />
                  </label>
                  <label style={{flex: 1}}>MRP (per unit)
                    <input type="number" required min="0" step="0.01" value={batchForm.mrp} onChange={e => setBatchForm({...batchForm, mrp: e.target.value})} />
                  </label>
                </div>
                
                {message && <p className="message">{message}</p>}
                
                <button type="submit" className="primary" disabled={loading || !products.length} style={{marginTop: '1rem'}}>Create Batch</button>
                <button type="button" className="secondary" onClick={() => setShowCreateBatch(false)}>Cancel</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagerPage;
