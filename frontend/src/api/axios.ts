import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // URL ของ Backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// เพิ่ม Interceptor เพื่อแนบ Token ไปกับทุก Request ถ้ามี
api.interceptors.request.use(
  (config) => {
    // ✅ ดึง Token จาก sessionStorage ก่อน (สำหรับกรณีไม่ได้กดจำฉัน) 
    // ถ้าไม่มี ค่อยไปหาใน localStorage (สำหรับกรณีกดจำฉัน)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;