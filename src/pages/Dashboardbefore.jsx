import React, { useEffect, useState } from "react";
import API from "../api";
import VideoPlayer from "../components/VideoPlayer";
import TopBar from "../components/TopBar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [cams, setCams] = useState([]);
    const [status, setStatus] = useState({});
    const nav = useNavigate();

    // Ambil list kamera
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) nav("/");

        API.get("/cameras")
            .then((res) => setCams(res.data))
            .catch(() => nav("/"));
    }, [nav]);

    // Polling status kamera setiap 10 detik
    useEffect(() => {
        if (cams.length === 0) return;

        const fetchStatus = () => {
            API.get("/cameras/status")
                .then((res) => {
                    const stat = {};
                    res.data.forEach((cam) => {
                        stat[cam.id] = cam.active;
                    });
                    setStatus(stat);
                })
                .catch(() => {
                    const offlineStatus = {};
                    cams.forEach((cam) => (offlineStatus[cam.id] = false));
                    setStatus(offlineStatus);
                });
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);

        return () => clearInterval(interval);
    }, [cams]);

    // Fungsi untuk grouping kamera berdasarkan 5 karakter pertama kalau ada "CAM"
    const groupCamerasByUnit = (cameras) => {
        const grouped = {};

        cameras.forEach((cam) => {
            // Cek apakah nama mengikuti pola unit, contoh: 5 karakter awal + 'CAM' di posisi 5-7
            // Bisa disesuaikan sesuai pola
            if (/^.{5}CAM/.test(cam.name)) {
                const unit = cam.name.slice(0, 5); // ambil 5 karakter pertama sebagai unit
                if (!grouped[unit]) grouped[unit] = [];
                grouped[unit].push(cam);
            } else {
                if (!grouped["others"]) grouped["others"] = [];
                grouped["others"].push(cam);
            }
        });

        return grouped;
    };

    const groupedCams = groupCamerasByUnit(cams);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
            <TopBar title="CCTV Dashboard" />

            <main className="max-w-7xl mx-auto p-6 space-y-10">
                <h1 className="text-3xl font-extrabold mb-8 text-center tracking-wide">
                    Monitoring Kamera CCTV
                </h1>

                {/* Untuk setiap unit, kita buat baris horizontal */}
                {Object.entries(groupedCams).map(([unit, cameras]) => (
                    <section key={unit}>
                        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2">
                            {unit === "others" ? "Other Cameras" : `Unit: ${unit}`}
                        </h2>

                        {/* Baris kamera unit */}
                        <div className="flex space-x-6 overflow-x-auto">
                            {cameras.map((cam) => {
                                const isActive = status[cam.id];
                                return (
                                    <div
                                        key={cam.id}
                                        className={`bg-gray-700 rounded-3xl shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 w-72 flex-shrink-0 ${isActive ? "ring-4 ring-green-400" : "ring-4 ring-red-600"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-600">
                                            <h3 className="text-xl font-semibold">{cam.name}</h3>
                                            <div
                                                className={`w-5 h-5 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-red-600"
                                                    }`}
                                                title={isActive ? "Aktif" : "Offline"}
                                            />
                                        </div>

                                        <VideoPlayer url={cam.url} />

                                        <div className="px-6 py-3 bg-gray-800 text-center text-sm italic text-gray-300">
                                            Status:{" "}
                                            <span className={isActive ? "text-green-400" : "text-red-500"}>
                                                {isActive ? "Aktif" : "Offline"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}
