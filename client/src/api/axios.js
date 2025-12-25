import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://votemitra.onrender.com"
});


// Send token automatically
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user"); // make sure this matches your login storage key
  if (user) {
    const token = JSON.parse(user).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
