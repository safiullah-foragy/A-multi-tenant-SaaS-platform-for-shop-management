import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api";
import "../styles/app.css";

const BatchListAdmin = ({ api }) => {
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
      await api.patch(`/api/inventory/batches/${batch._id}`, { editingPermission: !batch.editingPermission });
      loadBatches();
    } catch (err) {
      alert("Failed to update permission");
    }
  };

  const handleDelete = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await api.delete(`/api/inventory/batches/${batchId}`);
      loadBatches();
    } catch (err) {
      alert("Failed to delete batch");
    }
  };

  const startEdit = (batch) => {
    const margin = (batch.mrp || 0) - (batch.costPrice || 0);
    window.alert(`Note:\n1. A discount up to ${margin} (MRP - Cost) will be cut from your profit for that product.\n2. A discount greater than ${margin} will reduce your cost.`);
    setEditingId(batch._id);
    setEditForm({
      quantity: batch.quantity,
      mrp: batch.mrp,
      costPrice: batch.costPrice,
      discount: batch.discount || 0
    });
  };

  const saveEdit = async (batchId) => {
    try {
      await api.patch(`/api/inventory/batches/${batchId}`, {
        quantity: Number(editForm.quantity),
        mrp: Number(editForm.mrp),
        costPrice: Number(editForm.costPrice),
        discount: Number(editForm.discount || 0)
      });
      setEditingId(null);
      loadBatches();
    } catch (err) {
      alert("Failed to update batch");
    }
  };

  const downloadReport = (titleDate, dateBatches) => {
    const doc = new jsPDF();
    const title = 'Store - Batch Report';
    const subtitle = `Date: ${titleDate}`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 28);

    const tableColumn = ["Product Name", "Product ID", "Size", "Quantity", "Cost", "MRP", "Discount", "Created By"];
    const tableRows = [];

    dateBatches.forEach(batch => {
      const batchData = [
        batch.productId?.name || "N/A",
        batch.productId?.barcode || "N/A",
        batch.productId?.size || "N/A",
        batch.quantity,
        batch.costPrice,
        batch.mrp,
        batch.discount || 0,
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

    doc.save(`Report_${titleDate.replace(/\//g, '-')}.pdf`);
  };

  const groupedBatches = batches.reduce((acc, batch) => {
    const d = new Date(batch.createdAt).toLocaleDateString();
    const pName = batch.productId?.name || 'Unknown';
    const groupKey = `${d} - ${pName}`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(batch);
    return acc;
  }, {});

  return (
    <div className="admin-table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
      {Object.keys(groupedBatches).length === 0 ? (
        <p style={{padding: '1rem'}}>No batches found.</p>
      ) : (
        <div className="stack">
          {Object.keys(groupedBatches).sort((a,b) => new Date(b.split(" - ")[0]) - new Date(a.split(" - ")[0])).map(date => (
            <div key={date} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem'}}>
              <div 
                onClick={() => toggleDate(date)} 
                style={{padding: '1rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
              >
                <strong>{date}</strong>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); downloadReport(date, groupedBatches[date]); }} 
                    className="btn-secondary" 
                    style={{fontSize: '0.8rem', padding: '0.2rem 0.6rem'}}
                  >
                    Download Report
                  </button>
                  <span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>
                </div>
              </div>
              
              {expandedDates[date] && (
                <div style={{padding: '1rem', overflowX: 'auto'}}>
                  <table className="admin-table">
                    <thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Remaining</th><th>MRP</th><th>Cost</th><th>Discount</th><th>Created By</th><th>Permissions</th><th>Actions</th></tr></thead>
                    <tbody>
                      {groupedBatches[date].map(b => (
                        <tr key={b._id}><td>{b.productId?.name || 'Unknown'}</td>
                          <td>{b.productId?.size || 'N/A'}</td>{editingId === b._id ? (
                            <><td><input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} style={{width: '60px'}} /></td>
                              <td>{b.remainingQuantity}</td>
                              <td><input type="number" value={editForm.mrp} onChange={e => setEditForm({...editForm, mrp: e.target.value})} style={{width: '60px'}} /></td>
                              <td><input type="number" value={editForm.costPrice} onChange={e => setEditForm({...editForm, costPrice: e.target.value})} style={{width: '60px'}} /></td>
                              <td><input type="number" value={editForm.discount}
 onChange={e => setEditForm({...editForm, discount: e.target.value})} style={{width: '60px'}} /></td></>
                          ) : (
                            <><td>{b.quantity}</td>
                              <td>{b.remainingQuantity}</td>
                              <td>{b.mrp}</td>
                              <td>{b.costPrice}</td>
                              <td>{b.discount || 0}</td></>
                          )}<td>{b.creatorName || "Unknown"}</td><td><button 
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
                          </td></tr>
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
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [cashiers, setCashiers] = useState([]);
  const [stockManagers, setStockManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalRole, setModalRole] = useState("cashier");
  const [form, setForm] = useState({ name: "", gmail: "", phone: "", address: "", age: "", gender: "Male", password: "", isActive: true, otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/api/staff/list");
      setCashiers(res.data.cashiers || []);
      setStockManagers(res.data.stockManagers || []);
    } catch (err) { }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    navigate("/");
  };

  const openModal = (role) => {
    setModalRole(role);
    setShowModal(true);
    setOtpSent(false);
    setMessage("");
    setForm({ name: "", gmail: "", phone: "", address: "", age: "", gender: "Male", password: "", isActive: true, otp: "" });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const requestOtp = async () => {
    try {
      setMessage("Sending OTP...");
      await api.post(`/api/staff/request-otp`, {
        staffGmail: form.gmail,
        role: modalRole
      });
      setOtpSent(true);
      setMessage(`OTP sent to ${form.gmail}`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setMessage("Verifying OTP and creating...");
      const staffData = {
        name: form.name,
        gmail: form.gmail,
        phone: form.phone,
        address: form.address,
        age: form.age === "" ? undefined : Number(form.age),
        gender: form.gender,
        password: form.password,
        isActive: form.isActive
      };

      await api.post(`/api/staff/verify-and-create`, {
        otp: form.otp,
        staffData,
        role: modalRole,
      });
      setMessage("Created successfully!");
      fetchStaff();
      setTimeout(() => closeModal(), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error creating");
    }
  };

  const handleToggleStatus = async (id, currentStatus, role) => {
    try {
      await api.patch(`/api/staff/${id}/toggle-status`, { isActive: !currentStatus, role });
      fetchStaff();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteStaff = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      await api.delete(`/api/staff/${id}?role=${encodeURIComponent(role)}`);
      fetchStaff();
    } catch (err) {
      alert("Error deleting staff");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="secondary" onClick={handleLogout}>Logout</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="primary" onClick={() => openModal("cashier")}>+ Create Cashier</button>
          <button className="primary" onClick={() => openModal("stockManager")}>+ Create Stock Manager</button>
        </div>
        <div style={{ width: '80px' }}></div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        <section className="admin-section">
          <div className="admin-header">
            <h2>Cashiers</h2>
          </div>
          <div className="admin-table-wrapper">
             <table className="admin-table">
               <thead><tr><th>Name</th><th>Gmail</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
               <tbody>
                  {cashiers.length === 0 ? (
                    <tr><td colSpan="5">No cashiers found.</td></tr>
                  ) : (
                    cashiers.map((c) => (
                      <tr key={c._id}><td>{c.name}</td>
                        <td>{c.gmail}</td>
                        <td>{c.phone}</td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={c.isActive} 
                              onChange={() => handleToggleStatus(c._id, c.isActive, 'cashier')}
                            />
                            {c.isActive ? "Active" : "Inactive"}
                          </label>
                        </td><td><button className="secondary" style={{padding: "0.2rem 0.5rem", fontSize: "0.8rem", backgroundColor: "#ef4444"}} onClick={() => handleDeleteStaff(c._id, 'cashier')}>Delete</button>
                        </td></tr>
                    ))
                  )}
               </tbody>
             </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-header">
            <h2>Stock Managers</h2>
          </div>
          <div className="admin-table-wrapper">
             <table className="admin-table">
               <thead><tr><th>Name</th><th>Gmail</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
               <tbody>
                  {stockManagers.length === 0 ? (
                    <tr><td colSpan="5">No stock managers found.</td></tr>
                  ) : (
                    stockManagers.map((s) => (
                      <tr key={s._id}><td>{s.name}</td>
                        <td>{s.gmail}</td>
                        <td>{s.phone}</td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={s.isActive} 
                              onChange={() => handleToggleStatus(s._id, s.isActive, 'stockManager')}
                            />
                            {s.isActive ? "Active" : "Inactive"}
                          </label>
                        </td><td><button className="secondary" style={{padding: "0.2rem 0.5rem", fontSize: "0.8rem", backgroundColor: "#ef4444"}} onClick={() => handleDeleteStaff(s._id, 'stockManager')}>Delete</button>
                        </td></tr>
                    ))
                  )}
               </tbody>
             </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-header">
            <h2>Manage Stock</h2>
          </div>
          <BatchListAdmin api={api} />
        </section>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <h2>Create {modalRole === 'cashier' ? 'Cashier' : 'Stock Manager'}</h2>
             
             <form className="stack admin-form" onSubmit={handleCreate}>
               <label>Name
                 <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} disabled={otpSent} />
               </label>
               <label>Gmail
                 <input type="email" required value={form.gmail} onChange={(e) => setForm({...form, gmail: e.target.value})} disabled={otpSent} />
               </label>
               <label>Phone Number
                 <input type="text" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} disabled={otpSent} />
               </label>
               <label>Address
                 <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} disabled={otpSent} />
               </label>
               <div style={{display: 'flex', gap: '1rem'}}>
                 <label style={{flex: 1}}>Age
                   <input type="number" min="0" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} disabled={otpSent} />
                 </label>
                 <label style={{flex: 1}}>Gender
                   <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} disabled={otpSent} style={{marginTop: "0.5rem", width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #1e293b", backgroundColor: "#020617", color: "#f8fafc"}}>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                     <option value="Prefer not to say">Prefer not to say</option>
                   </select>
                 </label>
               </div>
               <label>Password
                 <input type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} disabled={otpSent} />
               </label>
               <label className="checkbox-label">
                 <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} disabled={otpSent} />
                 Active upon creation
               </label>
               
               {!otpSent ? (
                 <button type="button" onClick={requestOtp}>Send OTP to {modalRole}</button>
               ) : (
                 <div className="otp-box stack">
                   <label>Verify OTP
                     <input type="text" required value={form.otp} onChange={(e) => setForm({...form, otp: e.target.value})} placeholder="Check email for OTP" />
                   </label>
                   <button type="submit">Verify & Create</button>
                 </div>
               )}
               {message && <p className="message" style={{color: '#94a3b8'}}>{message}</p>}
             </form>
             <button className="secondary" style={{marginTop: "1rem"}} onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
