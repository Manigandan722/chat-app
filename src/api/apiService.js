import axios from "axios";

const api = axios.create({
    baseURL: "https://websocket-server-production-4b30.up.railway.app/", // Your API base URL
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Retrieve token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Attach Authorization header
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
