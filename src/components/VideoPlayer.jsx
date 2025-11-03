import React, { useRef, useEffect, useState } from "react";

export default function VideoPlayer({ url, type = "auto" }) {
    const imgRef = useRef(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // ✅ IMPROVED: Deteksi tipe stream yang lebih komprehensif
    const getStreamType = () => {
        if (type !== "auto") return type;
        if (!url) return "unknown";
        
        // Deteksi semua pattern MJPEG
        if (url.includes('/video?cameraId=') || 
            url.includes('/api/cameras/') || 
            url.includes('/videofeed') ||
            url.includes('/video') && !url.includes('.jpg')) {
            return "mjpeg";
        }
        
        // Deteksi snapshot
        if (url.includes('/shot.jpg') || url.includes('/snapshot') || url.includes('.jpg')) {
            return "snapshot";
        }
        
        return "unknown";
    };

    const streamType = getStreamType();

    // ✅ IMPROVED: Cache busting yang lebih efektif
    const getStreamUrl = () => {
        if (!url) return '';
        
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${Date.now()}&retry=${retryCount}&cache=bust`;
    };

    useEffect(() => {
        if (!url || streamType !== "mjpeg") return;

        console.log(`🎬 Starting ${streamType} stream: ${url}`);
        setError(null);
        setIsLoading(true);

        const img = imgRef.current;
        if (!img) return;

        let retryTimeout;
        const maxRetries = 5; // ✅ Increased retries
        let currentRetry = 0;

        const handleLoad = () => {
            console.log(`✅ Stream loaded successfully`);
            setIsLoading(false);
            setError(null);
            setRetryCount(0);
            currentRetry = 0;
        };

        const handleError = (e) => {
            console.error(`❌ Stream load failed:`, e);
            currentRetry++;

            if (currentRetry < maxRetries) {
                setError(`Menghubungkan ke kamera... (${currentRetry}/${maxRetries})`);
                
                // ✅ Exponential backoff untuk retry
                const delay = Math.min(1000 * Math.pow(2, currentRetry), 10000);
                
                retryTimeout = setTimeout(() => {
                    console.log(`🔄 Retrying stream... (${currentRetry}/${maxRetries})`);
                    img.src = getStreamUrl();
                }, delay);
            } else {
                setError("Tidak dapat terhubung ke kamera. Pastikan kamera aktif dan dapat diakses.");
                setIsLoading(false);
                setRetryCount(0);
            }
        };

        // ✅ Better event listeners dengan cleanup
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        img.addEventListener('abort', handleError);

        // Start loading stream
        img.src = getStreamUrl();

        // ✅ Auto-refresh untuk menjaga koneksi (setiap 30 detik)
        const refreshInterval = setInterval(() => {
            if (!isLoading && !error) {
                console.log('🔄 Refreshing stream connection...');
                img.src = getStreamUrl();
            }
        }, 30000);

        // Cleanup
        return () => {
            if (retryTimeout) clearTimeout(retryTimeout);
            clearInterval(refreshInterval);
            
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            img.removeEventListener('abort', handleError);
        };
    }, [url, streamType, retryCount]);

    // ✅ IMPROVED: Loading dan error states
    const renderOverlay = () => {
        if (isLoading && !error) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="text-white text-sm px-4 py-2 bg-blue-500/80 rounded flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memuat stream kamera...
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="text-white text-sm px-4 py-2 bg-red-500/80 rounded text-center max-w-xs">
                        {error}
                        <button
                            onClick={() => {
                                setRetryCount(prev => prev + 1);
                                setIsLoading(true);
                                setError(null);
                            }}
                            className="block mt-2 px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (streamType === "mjpeg" || streamType === "snapshot") {
        return (
            <div className="w-full flex justify-center relative">
                <img
                    ref={imgRef}
                    alt="Live Camera Stream"
                    className="w-full rounded-xl shadow-lg max-h-[400px] object-contain bg-black"
                    crossOrigin="anonymous"
                    onLoadStart={() => setIsLoading(true)}
                />
                
                {renderOverlay()}

                {/* ✅ Debug info untuk development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {streamType} | {retryCount} retries
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center items-center h-48 bg-gray-800 rounded-xl">
            <div className="text-center">
                <p className="text-gray-400 mb-2">Tipe stream tidak didukung</p>
                <p className="text-gray-500 text-sm">URL: {url}</p>
                <p className="text-gray-500 text-sm">Tipe terdeteksi: {streamType}</p>
            </div>
        </div>
    );
}