import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { setAuthToken } from "../api";

const OwnerLoginPage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const location = useLocation();

  const [shops, setShops] = useState([]);
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
      const { data } = await api.post("/api/auth/login", loginForm);

      if (data.owner?.shopId !== shopId) {
        setAuthToken(null);
        setMessage("This account is not the owner of the selected shop");
        return;
      }

      setAuthToken(data.token);
      navigate("/profile");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const triggerForgotPassword = async () => {
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
      const { data } = await api.post("/api/auth/password/request-otp", {
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
      const { data } = await api.post("/api/auth/password/request-otp", {
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
      await api.post("/api/auth/password/validate-otp", {
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
      await api.post("/api/auth/password/verify-otp", {
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
    <div className="owner-login-page">
      <main className="owner-layout">
        <section className="card owner-login-card">
          <h1>{forgotMode ? "Forgot password" : "Login as owner"}</h1>
          <p className="sub">{forgotMode ? "Get OTP on gmail and set a new password" : "Use gmail or phone number with your password"}</p>

          {!forgotMode ? (
            <form className="stack" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Gmail or phone number"
                value={loginForm.identifier}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={triggerForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <>
              {forgotStep === 1 && (
                <form className="stack" onSubmit={handleRequestResetOtp}>
                  <input
                    type="email"
                    placeholder="Owner gmail"
                    value={resetForm.gmail}
                    onChange={(e) => setResetForm((prev) => ({ ...prev, gmail: e.target.value }))}
                    required
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? "Sending OTP..." : "Get OTP"}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form className="stack otp-box" onSubmit={handleValidateResetOtp}>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={resetForm.otp}
                    onChange={(e) => setResetForm((prev) => ({ ...prev, otp: e.target.value }))}
                    required
                  />
                  <button type="submit" disabled={loading || resetCountdown === 0}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <small>Time left: {resetCountdown}s</small>
                </form>
              )}

              {forgotStep === 3 && (
                <form className="stack otp-box" onSubmit={handleVerifyResetOtp}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setForgotMode(false);
                  setForgotStep(1);
                  setResetCountdown(0);
                  setResetForm({ gmail: "", otp: "", newPassword: "" });
                  setMessage("");
                }}
              >
                Back to login
              </button>
            </>
          )}

          {message && <p className="message">{message}</p>}
          <p className="back-home">
            <Link to="/">Back to shops</Link>
          </p>
        </section>

        <section className="card selected-shop-panel" aria-live="polite">
          <h2>Selected shop</h2>
          <div className="shop-preview-note">
            <p className="preview-name">{selectedShop?.shopName || "Loading shop..."}</p>
            <p>
              <strong>Shop ID:</strong> #{shopId?.slice(-4) || "..."}
            </p>
            <p>
              <strong>Location:</strong> {selectedShop?.shopLocation || "Not set"}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerLoginPage;
