import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const HomePage = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(true);


      

  const [signupForm, setSignupForm] = useState({
    phone: "",
    gmail: "",
    shopName: "",
    password: ""
  });
  const [signupOtp, setSignupOtp] = useState("");
  const [signupOtpRequested, setSignupOtpRequested] = useState(false);
  const [signupCountdown, setSignupCountdown] = useState(0);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchShops = async () => {
    try {
      const { data } = await api.get("/api/shops");
      setShops(data.shops || []);
    } finally {
      setIsLoadingShops(false);
    }
  };

  useEffect(() => {
    fetchShops().catch(() => setMessage("Failed to load shop list"));
  }, []);

  useEffect(() => {
    if (signupCountdown <= 0) return undefined;
    const timer = setTimeout(() => setSignupCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [signupCountdown]);
  
  
  const handleSignupRequest = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/signup/request-otp", signupForm);
      setSignupOtpRequested(true);
      setSignupCountdown(data.expiresInSeconds || 0);
      setMessage("OTP sent to your gmail");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupVerify = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post("/api/auth/signup/verify-otp", {
        gmail: signupForm.gmail,
        otp: signupOtp
      });
      setMessage("Shop created successfully");
      setShowCreateModal(false);
      await fetchShops();
      setSignupOtpRequested(false);
      setSignupOtp("");
      setSignupCountdown(0);
      setSignupForm({
        phone: "",
        gmail: "",
        shopName: "",
        password: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="page-shell">
      <div className="glow one" />
      <div className="glow two" />

      <main className="home-layout">
<section className="right-blank-area">
          {isLoadingShops ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }}>
              Loading shops...
            </div>
          ) : shops.length > 0 ? (
            <>
              
                            
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
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowCreateModal(true); }}
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
              </div>

              <div className="sticky-wrap">

                {shops.filter((shop) => (shop.shopName || "My Shop").toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  shops.filter((shop) => (shop.shopName || "My Shop").toLowerCase().includes(searchQuery.toLowerCase())).map((shop) => (
                    <button
                      type="button"
                      className="shop-sticky-note"
                      key={shop.shopId}
                      onClick={() => navigate(`/shops/${shop.shopId}/owner-login`, { state: { shop } })}
                      style={shop.shopLogoPath ? { 
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${shop.shopLogoPath})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: '#fff'
                      } : {}}
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
                        <div className="empty-shops-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
            </div>
          )}
        </section>


      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="card create-card" onClick={e => e.stopPropagation()} style={{ position: 'relative', zIndex: 100, minWidth: '350px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            
          <h1>Create Shop</h1>
          <p className="sub">Owner signup with OTP email verification</p>

          <form onSubmit={handleSignupRequest} className="stack">
            <input
              type="text"
              placeholder="Phone number"
              value={signupForm.phone}
              onChange={(e) => setSignupForm((s) => ({ ...s, phone: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Gmail"
              value={signupForm.gmail}
              onChange={(e) => setSignupForm((s) => ({ ...s, gmail: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Shop name"
              value={signupForm.shopName}
              onChange={(e) => setSignupForm((s) => ({ ...s, shopName: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) => setSignupForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
            <button type="submit" disabled={loading}>
              Create
            </button>
          </form>

          {signupOtpRequested && (
            <form onSubmit={handleSignupVerify} className="stack otp-box">
              <input
                type="text"
                placeholder="Enter OTP"
                value={signupOtp}
                onChange={(e) => setSignupOtp(e.target.value)}
                required
              />
              <button type="submit" disabled={loading || signupCountdown === 0}>
                Verify OTP
              </button>
              <small>Time left: {signupCountdown}s</small>
            </form>
          )}

          {message && <p className="message">{message}</p>}
        
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
