// import React, { useEffect, useRef } from "react";
// import Hls from "hls.js";

// const CCTVPlayer = ({ url }) => {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(url);
//       hls.attachMedia(videoRef.current);
//     } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
//       videoRef.current.src = url;
//     }
//   }, [url]);

//   return <video ref={videoRef} controls autoPlay muted width="640" height="360" />;
// };

// export default CCTVPlayer;

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const CCTVPlayer = ({ url }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if URL is MP4
    if (url.endsWith('.mp4')) {
      videoRef.current.src = url;
    } 
    // Handle HLS streams
    else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } 
    // Fallback for Safari HLS
    else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
    }
  }, [url]);

  return (
    <video 
      ref={videoRef} 
      controls 
      autoPlay 
      muted 
      width="640" 
      height="360"
      playsInline // Add playsinline for better mobile support
    />
  );
};

export default CCTVPlayer;