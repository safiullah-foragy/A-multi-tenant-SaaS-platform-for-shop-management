import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OwnerLoginPage from "./pages/OwnerLoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import StockManagerPage from "./pages/StockManagerPage";
import CashierPage from "./pages/CashierPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shops/:shopId/owner-login" element={<OwnerLoginPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-manager"
        element={
          <ProtectedRoute>
            <StockManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier"
        element={
          <ProtectedRoute>
            <CashierPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
