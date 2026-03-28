import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api";
import "../styles/app.css"; // Assuming there's some custom css, I'll update styles as needed.

const ProfilePage = () => {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopLogo, setShopLogo] = useState(null);
  const [message, setMessage] = useState("");
  
  // Admin Data
  const [admins, setAdmins] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    gmail: "",
    phone: "",
    password: "",
    homeAddress: "",
    otp: "",
    isActive: true
  });
  const [adminMessage, setAdminMessage] = useState("");

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/api/shops/me");
      setOwner(data.owner);
      setShopName(data.owner.shopName || "");
      setShopLocation(data.owner.shopLocation || "");
      loadAdmins();
    } catch (err) {
      setAuthToken(null);
      navigate("/");
    }
  };
  
  const loadAdmins = async () => {
    try {
      const { data } = await api.get("/api/admin/list");
      setAdmins(data.admins);
    } catch (err) {
      console.error("Failed to load admins", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("shopName", shopName);
    formData.append("shopLocation", shopLocation);
    if (shopLogo) {
      formData.append("shopLogo", shopLogo);
    }

    try {
      const { data } = await api.patch("/api/shops/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setOwner(data.owner);
      setMessage("Profile updated");
    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed");
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigate("/");
  };

  const requestAdminOtp = async (e) => {
    e.preventDefault();
    if (!adminForm.gmail) {
      setAdminMessage("Please provide the admin Gmail first.");
      return;
    }
    try {
      setAdminMessage("Sending OTP to admin email...");
      const { data } = await api.post("/api/admin/request-create-admin-otp", { adminGmail: adminForm.gmail });
      setOtpSent(true);
      setAdminMessage(data.message || "OTP sent to admin email!");
    } catch (err) {
      setAdminMessage(err.response?.data?.message || "Failed to request OTP.");
    }
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      await api.patch(`/api/admin/${adminId}/toggle-status`, { isActive: !currentStatus });
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(`/api/admin/${adminId}`);
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setAdminMessage("Creating admin...");
      const payload = {
        otp: adminForm.otp,
        adminData: {
          name: adminForm.name,
          gmail: adminForm.gmail,
          phone: adminForm.phone,
          password: adminForm.password,
          homeAddress: adminForm.homeAddress,
          isActive: adminForm.isActive
        }
      };
      await api.post("/api/admin/verify-and-create", payload);
      setAdminMessage("Admin created successfully!");
      setShowAdminModal(false);
      setOtpSent(false);
      setAdminForm({ name: "", gmail: "", phone: "", password: "", homeAddress: "", otp: "", isActive: true });
      loadAdmins(); // Refresh list
    } catch (err) {
      setAdminMessage(err.response?.data?.message || "Failed to create admin.");
    }
  };

  if (!owner) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page-split">
      {/* LEFT HALF: PROFILE */}
      <div className="profile-half left-half">
        <section className="profile-card">
          <div className="logo-wrap">
            {owner.shopLogoPath ? (
              <img className="profile-logo" src={owner.shopLogoPath} alt={owner.shopName} />
            ) : (
              <div className="profile-logo fallback">{(owner.shopName || "S").slice(0, 1).toUpperCase()}</div>
            )}
          </div>

          <h2 className="profile-title">Shop Profile</h2>

          <form className="stack" onSubmit={handleUpdate}>
            <label>
              Shop logo upload
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setShopLogo(e.target.files?.[0] || null)} />
            </label>

            <label>
              Shop name
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
            </label>

            <label>
              Shop location
              <input type="text" value={shopLocation} onChange={(e) => setShopLocation(e.target.value)} />
            </label>

            <div className="shop-meta">
              <p>
                <strong>Shop ID:</strong> {owner.shopId}
              </p>
              <p>
                <strong>Gmail:</strong> {owner.gmail}
              </p>
              <p>
                <strong>Phone:</strong> {owner.phone}
              </p>
            </div>

            <button type="submit">Save Profile</button>
            <button type="button" className="secondary" onClick={handleLogout}>
              Logout
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>
      </div>

      {/* RIGHT HALF: ADMIN MANAGEMENT */}
      <div className="profile-half right-half">
        <section className="admin-section">
          <div className="admin-header">
            <h2>Shop Admins</h2>
            <button className="primary" onClick={() => setShowAdminModal(true)}>+ Create Admin of Shop</button>
          </div>

          <div className="admin-table-wrapper">
             <table className="admin-table">
               <thead><tr><th>Name</th><th>Gmail</th><th>Phone</th><th>Address</th><th>Status</th><th>Created At</th><th>Actions</th></tr></thead>
               <tbody>
                  {admins.length === 0 ? (
                    <tr><td colSpan="7">No admins created yet.</td></tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin._id}>
                        <td>{admin.name}</td>
                        <td>{admin.gmail}</td>
                        <td>{admin.phone}</td>
                        <td>{admin.homeAddress || "N/A"}</td>
                        <td>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={admin.isActive}
                              onChange={() => toggleAdminStatus(admin._id, admin.isActive)}
                            />
                            <span className="slider"></span>
                          </label>
                          {admin.isActive ? " Active" : " Inactive"}
                        </td>
                        <td>{new Date(admin.createdAt).toLocaleString()}</td>
                        <td>
                          <button 
                            type="button"
                            onClick={() => handleDeleteAdmin(admin._id)}
                            style={{ background: '#ef4444', padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
             </table>
          </div>
        </section>
      </div>

      {/* CREATE ADMIN MODAL */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <h2>Create New Admin</h2>
             <p>Owner must verify via OTP to create a new admin.</p>
             
             <form className="stack admin-form" onSubmit={handleCreateAdmin}>
               <label>Admin Name
                 <input type="text" required value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} disabled={otpSent} />
               </label>
               <label>Admin Gmail
                 <input type="email" required value={adminForm.gmail} onChange={(e) => setAdminForm({...adminForm, gmail: e.target.value})} disabled={otpSent} />
               </label>
               <label>Admin Phone
                 <input type="text" required value={adminForm.phone} onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} disabled={otpSent} />
               </label>
               <label>Admin Password
                 <input type="password" required value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} disabled={otpSent} />
               </label>
               <label>Home Address
                 <input type="text" required value={adminForm.homeAddress} onChange={(e) => setAdminForm({...adminForm, homeAddress: e.target.value})} disabled={otpSent} />
               </label>
               <label className="checkbox-label">
                 <input type="checkbox" checked={adminForm.isActive} onChange={(e) => setAdminForm({...adminForm, isActive: e.target.checked})} disabled={otpSent} />
                 Active admin upon creation
               </label>
               
               {!otpSent ? (
                 <button type="button" onClick={requestAdminOtp}>Send OTP to Admin Email</button>
               ) : (
                 <div className="otp-box stack">
                   <label>Verify OTP (Sent to Admin Email)
                     <input type="text" required value={adminForm.otp} onChange={(e) => setAdminForm({...adminForm, otp: e.target.value})} placeholder="Check admin email for OTP" />
                   </label>
                   <button type="submit">Verify & Create Admin</button>
                 </div>
               )}
               {adminMessage && <p className="message" style={{color: '#94a3b8'}}>{adminMessage}</p>}
             </form>
             <button className="secondary" style={{marginTop: "1rem"}} onClick={() => { setShowAdminModal(false); setOtpSent(false); setAdminMessage(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
