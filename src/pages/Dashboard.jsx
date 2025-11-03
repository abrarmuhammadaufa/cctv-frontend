import React, { useState, useEffect } from "react";
import API from "../api";
import VideoPlayer from "../components/VideoPlayer";
import TopBar from "../components/TopBar";

export default function Dashboard() {
    const [cameras, setCameras] = useState([]);
    const [camerasStatus, setCamerasStatus] = useState([]);
    const [groupedCameras, setGroupedCameras] = useState({});
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedHouses, setExpandedHouses] = useState({});
    const [serverOnline, setServerOnline] = useState(true);

    // Load cameras and user data on component mount
    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(() => {
            loadCamerasStatus();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Group cameras by house when cameras data changes
    useEffect(() => {
        if (cameras.length > 0) {
            setGroupedCameras(groupCamerasByHouse(cameras));
        }
    }, [cameras]);

    const groupCamerasByHouse = (cameras) => {
        const grouped = {};

        cameras.forEach(camera => {
            // const houseMatch = camera.name.match(/^(S\d+N\d+)/);
            const houseMatch = camera.name.match(/^(S\d+N\d+|K\d+N\d+)/);
            const houseCode = houseMatch ? houseMatch[1] : "Lainnya";

            if (!grouped[houseCode]) {
                grouped[houseCode] = {
                    houseName: `Unit ${houseCode}`,
                    cameras: [],
                    onlineCount: 0,
                    totalCount: 0
                };
            }

            grouped[houseCode].cameras.push(camera);
            grouped[houseCode].totalCount++;
        });

        Object.keys(grouped).forEach(houseCode => {
            const house = grouped[houseCode];
            house.onlineCount = house.cameras.filter(camera => {
                const status = getCameraStatus(camera.id);
                return status === "online";
            }).length;
        });

        return grouped;
    };

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            setServerOnline(true);

            const [camerasRes, statusRes] = await Promise.all([
                API.get("/cameras"),
                API.get("/cameras/status")
            ]);

            setCameras(camerasRes.data);
            setCamerasStatus(statusRes.data);

        } catch (err) {
            console.error("Dashboard error:", err);

            if (err.code === 'ERR_NETWORK' || err.message?.includes('CONNECTION_REFUSED')) {
                setServerOnline(false);
                setError("Backend server tidak dapat dihubungi. Pastikan server berjalan di http://{$ip_address}:{$port_backend}");
            } else {
                setError("Gagal memuat data dashboard: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadCamerasStatus = async () => {
        try {
            const statusRes = await API.get("/cameras/status");
            setCamerasStatus(statusRes.data);
            setServerOnline(true);
        } catch (err) {
            console.error("Status update error:", err);
            if (err.code === 'ERR_NETWORK') {
                setServerOnline(false);
            }
        }
    };

    const handleTakeSnapshot = async (cameraId) => {
        try {
            await API.post(`/recordings/camera/${cameraId}/snapshot`);
            alert("Snapshot berhasil diambil!");
        } catch (err) {
            alert("Gagal mengambil snapshot: " + (err.response?.data?.message || err.message));
        }
    };

    const getCameraStatus = (cameraId) => {
        return camerasStatus.find(status => status.id === cameraId)?.status || "unknown";
    };

    const toggleHouseExpansion = (houseCode) => {
        setExpandedHouses(prev => ({
            ...prev,
            [houseCode]: !prev[houseCode]
        }));
    };

    // Calculate overall statistics
    const totalCameras = cameras.length;
    const onlineCameras = camerasStatus.filter(status => status.status === "online").length;
    const totalHouses = Object.keys(groupedCameras).length;
    const onlineHouses = Object.keys(groupedCameras).filter(houseCode =>
        groupedCameras[houseCode].onlineCount > 0
    ).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <TopBar title="CCTV Monitoring System" subtitle="Memuat dashboard..." />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-white text-xl">Memuat dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <TopBar
                title="CCTV Monitoring System RT 04"
                subtitle="Monitoring terkelompok per unit rumah"
            />

            {/* Server Status Warning */}
            {!serverOnline && (
                <div className="bg-red-500 text-white p-4 text-center">
                    <p className="font-bold">⚠️ Backend Server Offline</p>
                    <p>Pastikan backend server berjalan di http://{$ip_address}:{$port_backend}</p>
                    <button
                        onClick={loadDashboardData}
                        className="mt-2 bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100"
                    >
                        Coba Hubungi Kembali
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${serverOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <svg className={`w-6 h-6 ${serverOnline ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-400 text-sm">Server Status</p>
                                <p className={`text-2xl font-bold ${serverOnline ? 'text-green-400' : 'text-red-400'}`}>
                                    {serverOnline ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="bg-blue-500/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-400 text-sm">Total Unit</p>
                                <p className="text-2xl font-bold text-white">{totalHouses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="bg-yellow-500/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-400 text-sm">Total Kamera</p>
                                <p className="text-2xl font-bold text-white">{totalCameras}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-400 text-sm">Kamera Online</p>
                                <p className="text-2xl font-bold text-white">{onlineCameras}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                        <button
                            onClick={loadDashboardData}
                            className="mt-2 text-red-400 hover:text-red-300 underline text-sm"
                        >
                            Coba Muat Ulang
                        </button>
                    </div>
                )}

                {/* Houses Grid */}
                {serverOnline ? (
                    <div className="space-y-6">
                        {Object.entries(groupedCameras).map(([houseCode, houseData]) => (
                            <div key={houseCode} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                {/* House Header */}
                                <div
                                    className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                                    onClick={() => toggleHouseExpansion(houseCode)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${houseData.onlineCount > 0 ? "bg-green-500" : "bg-red-500"
                                                }`}></div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">{houseData.houseName}</h2>
                                                <p className="text-gray-400 text-sm">
                                                    {houseData.onlineCount}/{houseData.totalCount} kamera online
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-400 text-sm">
                                                {expandedHouses[houseCode] ? "Sembunyikan" : "Tampilkan"}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedHouses[houseCode] ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Cameras Grid - Conditional Rendering */}
                                {expandedHouses[houseCode] && (
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {houseData.cameras.map(camera => {
                                                const status = getCameraStatus(camera.id);
                                                return (
                                                    <div key={camera.id} className="bg-gray-750 rounded-lg border border-gray-600 overflow-hidden">
                                                        {/* Camera Header */}
                                                        <div className="p-3 border-b border-gray-600">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <h3 className="font-semibold text-white">{camera.name}</h3>
                                                                    <p className="text-gray-400 text-xs">{camera.location || `IP: ${camera.ip}`}</p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" :
                                                                        status === "offline" ? "bg-red-500" :
                                                                            "bg-yellow-500"
                                                                        }`}></div>
                                                                    <span className={`text-xs ${status === "online" ? "text-green-400" :
                                                                        status === "offline" ? "text-red-400" :
                                                                            "text-yellow-400"
                                                                        }`}>
                                                                        {status === "online" ? "Online" :
                                                                            status === "offline" ? "Offline" :
                                                                                "Unknown"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Video Stream */}
                                                        <div className="p-3">
                                                            <VideoPlayer
                                                                url={camera.mjpegUrl}
                                                                // url={camera.urlStream}
                                                                type="mjpeg"
                                                            />
                                                        </div>

                                                        {/* Camera Actions */}
                                                        <div className="p-3 bg-gray-700 border-t border-gray-600">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleTakeSnapshot(camera.id)}
                                                                    disabled={status !== "online" || !serverOnline}
                                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                                    </svg>
                                                                    Snapshot
                                                                </button>

                                                                <button
                                                                    onClick={() => setSelectedCamera(selectedCamera?.id === camera.id ? null : camera)}
                                                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors"
                                                                >
                                                                    {selectedCamera?.id === camera.id ? "Minimize" : "Expand"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-xl">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">Server Offline</h3>
                        <p className="text-gray-500 mb-4">Backend server tidak dapat dihubungi</p>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p>Pastikan:</p>
                            <p>• Backend server berjalan di http://192.168.1.8:5000</p>
                            <p>• Network connection stabil</p>
                            <p>• Port 5000 tidak diblok firewall</p>
                        </div>
                    </div>
                )}

                {/* No Cameras Message */}
                {serverOnline && cameras.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Kamera</h3>
                        <p className="text-gray-500">Silakan konfigurasi kamera di pengaturan backend.</p>
                    </div>
                )}
            </div>

            {/* Fullscreen Camera Modal */}
            {selectedCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-6xl">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">{selectedCamera.name} - Live View</h3>
                                <button
                                    onClick={() => setSelectedCamera(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <VideoPlayer
                                url={selectedCamera.mjpegUrl}
                                type="mjpeg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
