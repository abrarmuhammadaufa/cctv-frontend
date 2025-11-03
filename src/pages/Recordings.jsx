import React, { useEffect, useState } from "react";
import API from "../api";
import TopBar from "../components/TopBar";
import { useNavigate } from "react-router-dom";

export default function Recordings() {
    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState(null);
    const [filterCamera, setFilterCamera] = useState("all");
    const [cameras, setCameras] = useState([]);
    // const [activeTab, setActiveTab] = useState("snapshots");
    const nav = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            nav("/");
            return;
        }
        loadRecordingsData();
    }, [nav]);

    const loadRecordingsData = async () => {
        try {
            setIsLoading(true);
            const [recordingsRes, statsRes, camerasRes] = await Promise.all([
                API.get("/recordings"),
                API.get("/recordings/stats"),
                API.get("/cameras")
            ]);

            setRecordings(recordingsRes.data);
            setStats(statsRes.data);
            setCameras(camerasRes.data);

        } catch (err) {
            console.error("Failed to load recordings:", err);
            setError("Gagal memuat data rekaman");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRecording = async (cameraId, filename) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus rekaman ini?")) {
            return;
        }

        try {
            await API.delete(`/recordings/camera/${cameraId}/file/${filename}`);
            // Refresh recordings list
            loadRecordingsData();
            setSelectedRecording(null);
        } catch (err) {
            alert("Gagal menghapus rekaman");
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredRecordings = filterCamera === "all"
        ? recordings
        : recordings.filter(rec => rec.cameraId.toString() === filterCamera);

    const getCameraName = (cameraId) => {
        const camera = cameras.find(cam => cam.id === cameraId);
        return camera ? camera.name : `Kamera ${cameraId}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <TopBar title="Rekaman CCTV" subtitle="Memuat data..." />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-white text-center">Memuat rekaman...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <TopBar title="Rekaman CCTV" subtitle="Snapshot dan rekaman tersimpan" />

            <div className="container mx-auto px-4 py-6">
                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="bg-blue-500/20 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-400 text-sm">Total Rekaman</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalRecordings}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="bg-green-500/20 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-400 text-sm">Total Ukuran</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalSizeFormatted}</p>
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
                                    <p className="text-gray-400 text-sm">Kamera Aktif</p>
                                    <p className="text-2xl font-bold text-white">{stats.cameras.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="bg-yellow-500/20 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-400 text-sm">Terakhir Update</p>
                                    <p className="text-lg font-bold text-white">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-300">Filter Kamera:</label>
                        <select
                            value={filterCamera}
                            onChange={(e) => setFilterCamera(e.target.value)}
                            className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Semua Kamera</option>
                            {cameras.map(camera => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={loadRecordingsData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Recordings Grid */}
                {filteredRecordings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-xl">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Rekaman</h3>
                        <p className="text-gray-500">Belum ada snapshot yang diambil dari kamera.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredRecordings.map((rec) => (
                            <div
                                key={rec.id}
                                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 cursor-pointer group"
                                onClick={() => setSelectedRecording(rec)}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-gray-700 relative overflow-hidden">
                                    <img
                                        src={rec.url}
                                        alt={rec.filename}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B7280'%3E%3Cpath d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'/%3E%3C/svg%3E";
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {rec.sizeFormatted}
                                    </div>
                                </div>

                                {/* Recording Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-white truncate mb-1">
                                        {getCameraName(rec.cameraId)}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-2">
                                        {formatDate(rec.timestamp)}
                                    </p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Snapshot</span>
                                        <span>{rec.filename}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recording Detail Modal */}
            {selectedRecording && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {getCameraName(selectedRecording.cameraId)}
                                </h2>
                                <p className="text-gray-400">
                                    {formatDate(selectedRecording.timestamp)} • {selectedRecording.sizeFormatted}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleDeleteRecording(selectedRecording.cameraId, selectedRecording.filename)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Hapus
                                </button>
                                <button
                                    className="text-gray-400 hover:text-white transition-colors text-2xl font-bold"
                                    onClick={() => setSelectedRecording(null)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-auto">
                            <img
                                src={selectedRecording.url}
                                alt={selectedRecording.filename}
                                className="w-full h-auto rounded-lg"
                                onError={(e) => {
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B7280'%3E%3Cpath d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'/%3E%3C/svg%3E";
                                    e.target.className = "w-32 h-32 mx-auto";
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}