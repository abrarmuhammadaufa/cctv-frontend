import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [serverStatus, setServerStatus] = useState("checking");
    const nav = useNavigate();

    // Check server status on component mount
    useEffect(() => {
        checkServerStatus();
    }, []);

    const checkServerStatus = async () => {
        try {
            const response = await API.get("/health");
            if (response.data.status === "ok") {
                setServerStatus("online");
            } else {
                setServerStatus("error");
            }
        } catch (err) {
            setServerStatus("offline");
        }
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();

        setError("");

        // Validation
        if (!username.trim() || !password.trim()) {
            setError("Username dan password harus diisi");
            return;
        }

        setIsLoading(true);

        try {
            // Menggunakan endpoint yang sesuai dengan backend baru
            const res = await API.post("/auth/login", {
                username: username.trim(),
                password
            });

            // Store token and user data
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            setError("success");

            setTimeout(() => {
                nav("/dashboard");
            }, 1000);

        } catch (err) {
            let errorMessage = "Login gagal. Silakan coba lagi.";

            if (err.response?.status === 401) {
                errorMessage = "Username atau password salah";
            } else if (err.response?.status === 404) {
                errorMessage = "User tidak ditemukan";
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (!err.response) {
                errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    // ... rest of the component (server status, UI) remains the same as the improved version
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                {/* Header dengan server status */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">CCTV Monitoring RT 04</h2>
                    <p className="text-gray-400">Login untuk mengakses sistem</p>

                    {/* Server Status */}
                    <div className="mt-4 flex items-center justify-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${serverStatus === "online" ? "bg-green-400" :
                                serverStatus === "offline" ? "bg-red-400" :
                                    "bg-yellow-400"
                            }`}></div>
                        <span className={`text-sm ${serverStatus === "online" ? "text-green-400" :
                                serverStatus === "offline" ? "text-red-400" :
                                    "text-yellow-400"
                            }`}>
                            {serverStatus === "online" ? "Server Online" :
                                serverStatus === "offline" ? "Server Offline" :
                                    "Mengecek Server..."}
                        </span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && error !== "success" && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-300 text-sm flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {error === "success" && (
                        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <p className="text-green-300 text-sm flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Login berhasil! Mengarahkan...
                            </p>
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading || serverStatus === "offline"}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Belum punya akun?{" "}
                        <span className="text-blue-400">
                            Hubungi administrator sistem
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}