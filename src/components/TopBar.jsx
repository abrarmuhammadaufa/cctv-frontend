import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopBar({ title = "CCTV Monitoring System RT 04", subtitle }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const getCurrentPage = () => {
        const path = window.location.pathname;
        if (path === "/dashboard") return "Dashboard";
        if (path === "/recordings") return "Recordings";
        return "CCTV Monitoring RT 04";
    };

    return (
        <header className="bg-gray-800 border-b border-gray-700">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{title}</h1>
                        <p className="text-gray-400">
                            {subtitle || `Monitoring terkelompok per unit rumah - ${getCurrentPage()}`}
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-white">Welcome, {user?.username || "User"}</p>
                            <p className="text-gray-400 text-sm">{user?.role || "User"}</p>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate("/recordings")}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Recordings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}