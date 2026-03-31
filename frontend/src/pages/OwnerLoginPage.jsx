import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { setAuthToken } from "../api";

const OwnerLoginPage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const location = useLocation();

  const [shops, setShops] = useState([]);
  const [loginRole, setLoginRole] = useState(null);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetForm, setResetForm] = useState({
    gmail: "",
    otp: "",
    newPassword: ""
  });
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetCountdown, setResetCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const selectedFromState = location.state?.shop;

  useEffect(() => {
    if (selectedFromState?.shopId === shopId) {
      return;
    }

    api
      .get("/api/shops")
      .then(({ data }) => setShops(data.shops || []))
      .catch(() => setMessage("Failed to load shop info"));
  }, [selectedFromState, shopId]);

  const selectedShop = useMemo(() => {
    if (selectedFromState?.shopId === shopId) {
      return selectedFromState;
    }

    return shops.find((shop) => shop.shopId === shopId) || null;
  }, [selectedFromState, shopId, shops]);

  useEffect(() => {
    if (resetCountdown <= 0) return undefined;
    const timer = setTimeout(() => setResetCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resetCountdown]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (loginRole === "owner") {
        const { data } = await api.post("/api/auth/login", loginForm);

        if (data.owner?.shopId !== shopId) {
          setAuthToken(null);
          setMessage("This account is not the owner of the selected shop");
          return;
        }

        setAuthToken(data.token);
        localStorage.setItem("userRole", "owner");
        navigate("/profile");
      } else if (loginRole === "admin" || loginRole === "cashier" || loginRole === "stockManager") {
        const route = loginRole === "admin" ? "/api/auth/admin-login" : "/api/auth/staff-login";
        const resultKey = loginRole === "admin" ? "admin" : "staff";
        
        const { data } = await api.post(route, loginForm);

        if (data[resultKey]?.shopId !== shopId) {
          setAuthToken(null);
          setMessage(`This account is not a valid ${loginRole} of the selected shop`);
          return;
        }
        
        if (loginRole !== "admin" && data.role !== loginRole) {
          setAuthToken(null);
          setMessage(`This account is registered as ${data.role}, not ${loginRole}`);
          return;
        }

        setAuthToken(data.token);
        localStorage.setItem("userRole", loginRole);
        
        if (loginRole === "admin") navigate("/admin-dashboard");
        else if (loginRole === "stockManager") navigate("/stock-manager");
        else navigate("/cashier");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const triggerForgotPassword = async () => {
    if (loginRole === "admin" || loginRole === "cashier" || loginRole === "stockManager") {
      setForgotMode(true);
      setForgotStep(1);
      setMessage(`Please enter your ${loginRole} gmail.`);
      return;
    }

    setForgotMode(true);
    setMessage("");
    setLoading(true);

    if (!selectedShop?.gmail) {
      setForgotStep(1); // Fallback if no shop is selected or no gmail is loaded
      setMessage("Please enter your owner gmail.");
      setLoading(false);
      return;
    }

    setResetForm((prev) => ({ ...prev, gmail: selectedShop.gmail }));

    try {
      const { data } = await api.post(`${loginRole === 'admin' ? '/api/auth/admin-forgot-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password' : '/api/auth/password')}/request-otp`, {
        gmail: selectedShop.gmail
      });

      setForgotStep(2);
      setResetCountdown(data.expiresInSeconds || 0);
      setMessage(`Password reset OTP sent to ${selectedShop.gmail}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send reset OTP");
      setForgotStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post(`${loginRole === 'admin' ? '/api/auth/admin-forgot-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password' : '/api/auth/password')}/request-otp`, {
        gmail: resetForm.gmail
      });

      setForgotStep(2);
      setResetCountdown(data.expiresInSeconds || 0);
      setMessage("Password reset OTP sent to your gmail");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateResetOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post(`${loginRole === 'admin' ? '/api/auth/admin-forgot-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password' : '/api/auth/password')}/validate-otp`, {
        gmail: resetForm.gmail,
        otp: resetForm.otp
      });

      setForgotStep(3);
      setMessage("OTP verified. Please enter your new password.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post(`${loginRole === 'admin' ? '/api/auth/admin-forgot-password' : (loginRole === 'cashier' || loginRole === 'stockManager' ? '/api/auth/staff-forgot-password' : '/api/auth/password')}/${loginRole !== 'owner' && loginRole !== null ? 'reset-password' : 'verify-otp'}`, {
        gmail: resetForm.gmail,
        otp: resetForm.otp,
        newPassword: resetForm.newPassword
      });

      setForgotMode(false);
      setForgotStep(1);
      setResetCountdown(0);
      setLoginForm((prev) => ({ ...prev, identifier: resetForm.gmail, password: "" }));
      setResetForm({ gmail: "", otp: "", newPassword: "" });
      setMessage("Password changed successfully. Please login.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="glow one" />
      <div className="glow two" />

      <main className="auth-layout">
        {!loginRole ? (
          <section className="card role-card">
            <div className="role-selection">
              <h1>Welcome to {selectedShop?.shopName || "Shop"}</h1>
              <p className="sub">Select your role to continue</p>
              
              <div className="role-buttons-grid">
                <button type="button" onClick={() => setLoginRole("owner")} className="role-btn owner-btn">
                  <span className="role-icon">👤</span>
                  <span className="role-label">Owner</span>
                </button>
                <button type="button" onClick={() => setLoginRole("admin")} className="role-btn admin-btn">
                  <span className="role-icon">👨‍💼</span>
                  <span className="role-label">Admin</span>
                </button>
                <button type="button" onClick={() => setLoginRole("cashier")} className="role-btn cashier-btn">
                  <span className="role-icon">🏪</span>
                  <span className="role-label">Cashier</span>
                </button>
                <button type="button" onClick={() => setLoginRole("stockManager")} className="role-btn stock-btn">
                  <span className="role-icon">📦</span>
                  <span className="role-label">Stock Manager</span>
                </button>
              </div>

              {message && <p className="message error-message">{message}</p>}
              
              <Link to="/" className="back-link">
                ← Back to shops
              </Link>
            </div>
          </section>
        ) : (
          <div className="auth-container">
            <div className="auth-left">
              <div className="auth-left-content">
                {forgotMode ? (
                  <>
                    <h2>Reset Password</h2>
                    <p>Get OTP on your email and create a new password</p>
                  </>
                ) : (
                  <>
                    <h2>Welcome Back!</h2>
                    <p>Enter your credentials to access your account</p>
                  </>
                )}
                
                <button 
                  type="button"
                  className="btn-white"
                  onClick={() => {
                    setForgotMode(false);
                    setForgotStep(1);
                    setResetCountdown(0);
                    setResetForm({ gmail: "", otp: "", newPassword: "" });
                    setMessage("");
                  }}
                >
                  {forgotMode ? "Back to Login" : "Sign In"}
                </button>
              </div>
            </div>

            <div className="auth-right">
              <div className="auth-form-wrapper">
                <h3>{forgotMode ? "Password Recovery" : "Login"}</h3>
                <p className="form-sub">{forgotMode ? "Recover your account access" : "Sign in to your account"}</p>

                {!forgotMode ? (
                  <form className="auth-form form-enter" onSubmit={handleLogin}>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="E-mail or phone number"
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="form-input"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn-submit">
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={triggerForgotPassword}
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </form>
                ) : (
                  <form className="auth-form form-enter">
                    {forgotStep === 1 && (
                      <div className="forgot-step step-enter">
                        <div className="form-group">
                          <input
                            type="email"
                            placeholder="Enter your e-mail"
                            value={resetForm.gmail}
                            onChange={(e) => setResetForm((prev) => ({ ...prev, gmail: e.target.value }))}
                            required
                            className="form-input"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleRequestResetOtp}
                          disabled={loading}
                          className="btn-submit"
                        >
                          {loading ? "Sending OTP..." : "Get OTP"}
                        </button>
                      </div>
                    )}

                    {forgotStep === 2 && (
                      <div className="forgot-step step-enter">
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Enter OTP code"
                            value={resetForm.otp}
                            onChange={(e) => setResetForm((prev) => ({ ...prev, otp: e.target.value }))}
                            required
                            className="form-input"
                          />
                          <small className="countdown">Time left: {resetCountdown}s</small>
                        </div>
                        <button 
                          type="button"
                          onClick={handleValidateResetOtp}
                          disabled={loading || resetCountdown === 0}
                          className="btn-submit"
                        >
                          {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    )}

                    {forgotStep === 3 && (
                      <div className="forgot-step step-enter">
                        <div className="form-group">
                          <input
                            type="password"
                            placeholder="New password"
                            value={resetForm.newPassword}
                            onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                            required
                            className="form-input"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={handleVerifyResetOtp}
                          disabled={loading}
                          className="btn-submit"
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    )}
                  </form>
                )}

                {message && <p className="message error-message">{message}</p>}

                <div className="form-footer">
                  <button 
                    type="button" 
                    className="btn-link secondary"
                    onClick={() => { setLoginRole(null); setMessage(""); setForgotMode(false); }}
                  >
                    Change Role
                  </button>
                  <Link to="/" className="btn-link secondary">
                    Back to Shops
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerLoginPage;
