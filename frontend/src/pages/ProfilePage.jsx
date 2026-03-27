import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopLogo, setShopLogo] = useState(null);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    const { data } = await api.get("/api/shops/me");
    setOwner(data.owner);
    setShopName(data.owner.shopName || "");
    setShopLocation(data.owner.shopLocation || "");
  };

  useEffect(() => {
    loadProfile().catch(() => {
      setAuthToken(null);
      navigate("/");
    });
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

  if (!owner) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-cover">
        <div className="cover-pattern" />
      </header>

      <section className="profile-card">
        <div className="logo-wrap">
          {owner.shopLogoPath ? (
            <img className="profile-logo" src={owner.shopLogoPath} alt={owner.shopName} />
          ) : (
            <div className="profile-logo fallback">{(owner.shopName || "S").slice(0, 1).toUpperCase()}</div>
          )}
        </div>

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
  );
};

export default ProfilePage;
