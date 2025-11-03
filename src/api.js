import axios from "axios";

const API = axios.create({
    baseURL: "http://{$ip_address}:{$port_backend}/api",
    timeout: 15000,
});

// Request interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Token attached to request:", token.substring(0, 20) + "...");
    } else {
        console.warn("⚠️ No token found in localStorage");
    }
    return config;
});

// Response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.status, error.response?.data);

        if (error.response?.status === 403) {
            console.log("🔒 403 Forbidden - Token mungkin expired");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirect to login setelah delay
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        }

        return Promise.reject(error);
    }
);

export default API;
