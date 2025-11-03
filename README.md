# 📱 CCTV IP Webcam Frontend
Frontend React untuk sistem monitoring CCTV IP Webcam dengan antarmuka yang responsif dan real-time streaming.

# 🎯 Fitur
- 📹 Live Streaming - Tampilan real-time dari multiple kamera

- 🔐 Authentication - Login/register system

- 📱 Responsive Design - Optimal di desktop dan mobile

- 🔄 Auto Retry - Koneksi otomatis ulang jika terputus

- 🎨 Modern UI - Antarmuka yang clean dan user-friendly

- ⚡ Real-time Status - Status online/offline kamera

# 🚀 Teknologi
- React 18 - UI Framework

- Vite - Build tool dan development server

- Tailwind CSS - Styling

- Axios - HTTP client

- React Router - Navigation

- JWT - Authentication

# 📦 Instalasi & Setup
## Prerequisites
- Node.js 16+
  
- Backend server CCTV IP Webcam (terpisah)
  
- Aplikasi IP Webcam di perangkat Android (in-case menggunakan kamera HP bekas)

## 1. Clone Repository (bash)

```bash
git clone <frontend-repo-url>
cd cctv-ip-webcam-frontend
```

## 2. Install Dependencies (bash)

```bash
npm install
```

## 3. Konfigurasi Environment
Buat file `.env`:
```env
VITE_BACKEND_URL=SECRET_BACKEND_IP_ADDRESS
VITE_APP_NAME="CCTV Monitoring"
VITE_MAX_RETRIES=5
```
## 4. Jalankan Development Server (bash)
```cmd
# Development mode
npm run dev

# Atau
npm run dev -- --host //IP_ADDRESS//
```
Aplikasi akan berjalan di: `http://{$ip_address}:{$port_frontend}`

# 🏗️ Struktur Project (Kemungkinan Berubah)
```text
text
src/
├── components/
│   ├── VideoPlayer.jsx          # Komponen pemutar stream
│   ├── CameraGrid.jsx           # Grid layout kamera
│   ├── LoginForm.jsx            # Form login
│   ├── Navigation.jsx           # Navigasi
│   └── LoadingSpinner.jsx       # Indikator loading
├── pages/
│   ├── Dashboard.jsx            # Halaman utama
│   ├── Login.jsx                # Halaman login
│   ├── CameraDetail.jsx         # Detail kamera
│   └── Recordings.jsx           # Halaman rekaman
├── hooks/
│   ├── useAuth.js               # Hook authentication
│   ├── useCameras.js            # Hook manajemen kamera
│   └── useStream.js             # Hook streaming
├── services/
│   ├── api.js                   # Konfigurasi API
│   └── auth.js                  # Service authentication
├── utils/
│   ├── constants.js             # Konstanta aplikasi
│   └── helpers.js               # Helper functions
└── App.jsx                      # Komponen utama
```

# 🔌 Integrasi dengan Backend
## Konfigurasi API
javascript
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
## Menggunakan VideoPlayer
jsx
```jsx
import VideoPlayer from './components/VideoPlayer';

function CameraView() {
  return (
    <VideoPlayer 
      url="http://{$ip_address}:{$port_backend}/video?cameraId=1"
      type="mjpeg"
      className="w-full h-64"
      autoRetry={true}
      maxRetries={5}
    />
  );
}
```
# 🎮 Cara Penggunaan
## 1. Login
- Buka aplikasi di `http://{$ip_address}:{$port_frontend}` (masih development)

- Login dengan username dan password

- Token akan disimpan otomatis

## 2. Melihat Live Stream
- Dashboard menampilkan semua kamera

- Klik kamera untuk view detail

- Stream akan otomatis connect dan retry jika terputus

## 3. Multi-camera View
```jsx
import { useCameras } from './hooks/useCameras';

function Dashboard() {
  const { cameras, loading } = useCameras();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cameras.map(camera => (
        <VideoPlayer 
          key={camera.id}
          url={camera.mjpegUrl}
          title={camera.name}
        />
      ))}
    </div>
  );
}
```
# ⚙️ Komponen VideoPlayer
### Props
| Prop | Type |	Default | Description |
| :---: | :---: | :---: | :--- |
| url	| string	| required	| URL stream MJPEG |
| type	| string	| "mjpeg"	| Tipe stream (mjpeg/snapshot) | 
| className	| string	| ""	| Additional CSS classes | 
| autoRetry	| boolean	| true	| Auto retry on connection loss | 
| maxRetries	| number	| 5	| Maximum retry attempts | 
| retryDelay	| number	| 2000	| Delay between retries (ms) | 
| onError	| function	| null	| Callback ketika error | 
| onLoad	| function	| null	| Callback ketika stream loaded | 
## Contoh Penggunaan
jsx
```jsx
<VideoPlayer
  url={`http://{$ip_address}:{$port_backend}/video?cameraId=3`}
  type="mjpeg"
  className="rounded-lg shadow-lg"
  autoRetry={true}
  maxRetries={3}
  onError={(error) => console.error('Stream error:', error)}
  onLoad={() => console.log('Stream loaded successfully')}
/>
```
# 🔧 Konfigurasi
### Environment Variables
```env
# Backend API URL
VITE_BACKEND_URL=http://{$ip_address}:{$port_backend}

# Nama Aplikasi
VITE_APP_NAME="CCTV Monitoring"

# Konfigurasi Stream
VITE_MAX_RETRIES=5
VITE_RETRY_DELAY=2000
VITE_AUTO_REFRESH_INTERVAL=30000

# Feature Flags
VITE_ENABLE_RECORDINGS=true
VITE_ENABLE_MULTI_VIEW=true
```
## Customization
### Styling dengan Tailwind
```jsx
// Custom theme di tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'cctv-primary': '#1a365d',
        'cctv-secondary': '#2d3748',
      }
    }
  }
}
```
# 🐛 Troubleshooting
## Masalah Umum
### ❌ Stream Tidak Muncul
### 1. Check koneksi backend:

```bash
curl http://{$ip_address}:{$port_backend}/api/health
```
### 2. Test stream langsung:

```bash
curl http://{$ip_address}:{$port_backend}/video?cameraId=1
```
### 3. Check browser console untuk error CORS

### ❌ Authentication Error
### 1. Pastikan token valid:

```javascript
localStorage.getItem('token'); // Harus ada nilai
```
### 2. Check backend authentication:

### - Pastikan endpoint tidak membutuhkan auth untuk development

### ❌ Network Error
### 1. Pastikan IP address benar:

- Backend: {$ip_address}:{$port_backend}

- Frontend: {$ip_address}:{$port_frontend}

### 2. Check firewall/network settings

## Debug Mode
Aktifkan debug mode di browser console:

```javascript
localStorage.setItem('debug', 'true');
```
# 📱 Responsive Breakpoints
- Mobile: < 768px (1 kolom)

- Tablet: 768px - 1024px (2 kolom)

- Desktop: > 1024px (3-4 kolom)

# 🚀 Deployment
Build untuk Production
```bash
npm run build
```
File build akan tersedia di folder dist/

### Serve Production Build
```bash
npm run preview
```
### Deployment dengan Nginx
Contoh konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://{$ip_address}:{$port_backend};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
# 🔄 Scripts Available
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```
# 🤝 Kontribusi
1. Fork repository

2. Create feature branch: git checkout -b feature/new-feature

3. Commit changes: git commit -am 'Add new feature'

4. Push to branch: git push origin feature/new-feature

5. Submit pull request

# 📄 License
MIT License - lihat file LICENSE untuk detail.

# 🆘 Support
Jika mengalami masalah:

1. Check troubleshooting section

2. Pastikan backend server berjalan

3. Check console browser untuk error messages

4. Pastikan konfigurasi environment variables benar

Backend Repository: CCTV IP Webcam Backend (belum insert link

Dibuat dengan ❤️ untuk monitoring CCTV berbasis React
