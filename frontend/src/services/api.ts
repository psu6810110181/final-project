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

// --- Interfaces ---
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string; // รองรับทั้ง number และ string กันเหนียว
  stock: number;
  category?: string; 
  room?: string;
  features?: string[];
  image: string; // รับเป็น JSON string จาก Backend
}

export interface Category {
  id: number;
  name: string;
}

export interface Room { 
  id: number; 
  name: string; 
}

export interface Feature { 
  id: number; 
  name: string; 
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  priceAtPurchase: number | string;
  installationQty?: number;
}

export interface Order {
  id: string;
  orderDate: string;
  totalAmount: number | string;
  
  // 👇 เพิ่ม 3 บรรทัดนี้เข้ามารองรับค่าใช้จ่ายย่อย
  totalAmountProduct: number | string; 
  totalAmountInstallation: number | string;
  shippingFee?: number | string; // (อนาคต) เผื่อ Backend ส่งค่าจัดส่งมา
  
  status: string;
  shippingAddress: string;
  items: OrderItem[];
}

// --- API Functions ---

// 1. Auth & User
export const loginUser = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; 
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// ดึงข้อมูลโปรไฟล์ตัวเอง
export const getProfile = async () => {
  const response = await api.get('/users/profile/me');
  return response.data;
};

// อัปเดตโปรไฟล์ (รองรับทั้งข้อมูล Text และรูปภาพ)
export const updateProfile = async (formData: FormData) => {
  const response = await api.patch('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};


// 2. Products
export const getAllProducts = async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
};

export const getProductById = async (id: string): Promise<Product> => { // แก้ Return type เป็น Product เดียว
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async (productData: any) => {
    // ถ้ามีการส่งไฟล์รูปสินค้า ต้องใช้ FormData
    const response = await api.post('/products', productData);
    return response.data;
};


// 3. Categories
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (name: string) => {
  const response = await api.post('/categories', { name });
  return response.data;
};

export const deleteCategory = async (id: number) => {
  return await api.delete(`/categories/${id}`);
};

// 4. Rooms
export const getAllRooms = async (): Promise<Room[]> => {
  const response = await api.get('/rooms');
  return response.data;
};

export const createRoom = async (name: string) => {
  return await api.post('/rooms', { name });
};

export const deleteRoom = async (id: number) => {
  return await api.delete(`/rooms/${id}`);
};

// 5. Features
export const getAllFeatures = async (): Promise<Feature[]> => {
  const response = await api.get('/features');
  return response.data;
};

export const createFeature = async (name: string) => {
  return await api.post('/features', { name });
};

export const deleteFeature = async (id: number) => {
  return await api.delete(`/features/${id}`);
};

// ---------------------------------------------------------
// ✅ 6. Cart (ตะกร้าสินค้า)
// ---------------------------------------------------------
export const getCart = async () => {
  return await api.get('/cart-items');
};

export const addToCart = async (productId: string | number, quantity: number, installationQty: number = 0) => {
  return await api.post('/cart-items', { productId, quantity, installationQty });
};

export const updateCartItem = async (id: number, data: { quantity?: number, installationQty?: number }) => {
  return await api.patch(`/cart-items/${id}`, data);
};

export const removeCartItem = async (id: number) => {
  return await api.delete(`/cart-items/${id}`);
};

export const clearCart = async () => {
  return await api.delete('/cart-items'); 
};


// ---------------------------------------------------------
// ✅ 7. Orders (การสั่งซื้อ)
// ---------------------------------------------------------
export const checkout = async (address: string) => {
  const response = await api.post('/orders/checkout', { address });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`); 
  return response.data;
};

export const uploadSlip = async (orderId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/orders/upload-slip/${orderId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const cancelOrder = async (orderId: string) => {
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  return await api.patch(`/orders/${orderId}/status`, { status });
};

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// ---------------------------------------------------------
// ✅ 8. Reviews (รีวิวสินค้า)
// ---------------------------------------------------------

// ดึงรีวิวตาม ID สินค้า
export const getReviewsByProduct = async (productId: string) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// สร้างรีวิวใหม่
export const createReview = async (reviewData: { productId: string; orderId: string; rating: number; comment: string }) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export default api;