import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || ""
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("authToken", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("authToken");
  }
};

const savedToken = localStorage.getItem("authToken");
if (savedToken) {
  setAuthToken(savedToken);
}

export default api;
