import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const HomePage = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);

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
    const { data } = await api.get("/api/shops");
    setShops(data.shops || []);
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
        <section className="card create-card">
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
        </section>

        <section className="right-blank-area">
          {shops.length > 0 ? (
            <div className="sticky-wrap">
              {shops.map((shop) => (
                <button
                  type="button"
                  className="shop-sticky-note"
                  key={shop.shopId}
                  onClick={() => navigate(`/shops/${shop.shopId}/owner-login`, { state: { shop } })}
                >
                  <span className="shop-name">{shop.shopName || "My Shop"}</span>
                  <small className="shop-id">#{shop.shopId.slice(-4)}</small>
                  <small className="enter-shop">Enter Studio →</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-shops-state">
              <h2>Welcome to ShopSaaS</h2>
              <p>Create your first shop from the left panel to get started.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
