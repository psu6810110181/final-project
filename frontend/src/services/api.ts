import axios from 'axios';

// URL ของ Backend (NestJS รันที่ Port 3000)
const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: แนบ Token ไปกับทุก Request ถ้ามี Token ใน localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- API Functions ---

// 1. Login
export const loginUser = async (credentials: { username: string; password: string }) => {
  // ยิงไปที่ AuthController @Post('auth/login')
  const response = await api.post('/auth/login', credentials);
  return response.data; // คาดหวัง { access_token: "..." }
};

// 2. Register
export const registerUser = async (userData: any) => {
  // ยิงไปที่ UsersController @Post('users')
  const response = await api.post('/users', userData);
  return response.data;
};

// 3. Get User Profile (ตัวอย่าง: ต้องใช้ ID หรือมี Endpoint getProfile)
// เนื่องจาก Backend ให้ updateProfile แต่ดึงข้อมูลใช้ Get(':id') 
// เราจะพักไว้ก่อน รอเชื่อม Context เสร็จ
export default api;