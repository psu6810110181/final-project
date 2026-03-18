import api from '../api/axios'; // ✅ ดึง Axios Instance ที่ถูกตั้งค่าไว้แล้วมาใช้งานแทน

// ---------------------------------------------------------
// ✅ Interfaces
// ---------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  category?: string; 
  room?: string;
  features?: string[];
  image: string; 
  variants?: Variant[];
  // ✅ Main product attributes
  color?: string;
  material?: string;
  size?: string;
  mainColor?: string;
  mainMaterial?: string;
  mainSize?: string;
  mainStock?: number;
}

export interface Category { id: number; name: string; }
export interface Room { id: number; name: string; }
export interface Feature { id: number; name: string; }
export interface Color { id: number; name: string; }
export interface Material { id: number; name: string; }
export interface Size { id: number; name: string; }

export interface Variant {
  id?: number; // ✅ เพิ่ม id ของ variant เผื่อต้องใช้งาน
  color: string;
  material: string;
  size: string;
  price: string;
  stock: string;
  image?: string;
  imageUrl?: string;
  imageFile?: File;
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
  totalAmountProduct: number | string; 
  totalAmountInstallation: number | string;
  shippingFee?: number | string;
  status: string;
  shippingAddress: string;
  items: OrderItem[];
  paymentSlip?: string;
}

export interface Review {
  id?: string;
  productId: string;
  rating: number;
  comment: string;
  user?: { username: string };
  createdAt?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFlashSale: boolean;
  products?: Product[];
  createdAt?: string;
  updatedAt?: string;
}

// ✅ สร้าง Helper function ดึง Token จากที่ไหนก็ได้ที่มี
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// ✅ สร้าง Header สำหรับเคสที่ต้องการส่ง Token แยก (ถ้า axios interceptor ยังไม่ได้ทำ)
export const authHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// ---------------------------------------------------------
// ✅ API Functions
// ---------------------------------------------------------

// 1. Auth & User
export const loginUser = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; 
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile/me');
  return response.data;
};

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

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: any) => {
  const isFormData = productData instanceof FormData;
  const response = await api.post('/products', productData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const updateProduct = async (id: string, productData: any) => {
  const isFormData = productData instanceof FormData;
  const response = await api.patch(`/products/${id}`, productData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  return await api.delete(`/products/${id}`);
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

// 6. Colors
export const getAllColors = async (): Promise<Color[]> => {
  const response = await api.get('/colors');
  return response.data;
};

export const createColor = async (name: string) => {
  return await api.post('/colors', { name });
};

export const deleteColor = async (id: number) => {
  return await api.delete(`/colors/${id}`);
};

// 7. Materials
export const getAllMaterials = async (): Promise<Material[]> => {
  const response = await api.get('/materials');
  return response.data;
};

export const createMaterial = async (name: string) => {
  return await api.post('/materials', { name });
};

export const deleteMaterial = async (id: number) => {
  return await api.delete(`/materials/${id}`);
};

// 8. Sizes
export const getAllSizes = async (): Promise<Size[]> => {
  const response = await api.get('/sizes');
  return response.data;
};

export const createSize = async (name: string) => {
  return await api.post('/sizes', { name });
};

export const deleteSize = async (id: number) => {
  return await api.delete(`/sizes/${id}`);
};

// 9. Cart
export const getCart = async () => {
  return await api.get('/cart-items');
};

// ✅ แก้ไขให้รับ variantId ได้ และกรองค่าก่อนส่งให้ Backend
export const addToCart = async (productId: string | number, quantity: number, installationQty: number = 0, variantId?: number) => {
  // ✅ จัดเตรียมข้อมูลพื้นฐาน
  const payload: any = { productId, quantity, installationQty };
  
  // ✅ ตรวจสอบว่าถ้ามี variantId จริงๆ ค่อยแนบไป (ป้องกันการส่ง null/undefined ไปให้ Backend)
  if (variantId !== undefined && variantId !== null) {
    payload.variantId = variantId;
  }
  
  return await api.post('/cart-items', payload);
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

// 10. Orders
export const checkout = async (address: string) => {
  const response = await api.post('/orders/checkout', { address });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
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
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// สำหรับปุ่มชำระเงินต่อ (Retry Payment)
export const retryPayment = async (orderId: string) => {
  const response = await api.post(`/orders/${orderId}/retry-payment`);
  return response.data;
};

// 11. Promotions
export const getAllPromotions = async (): Promise<Promotion[]> => {
  const response = await api.get('/promotions');
  return response.data;
};

export const getActiveFlashSales = async (): Promise<Promotion[]> => {
  const token = localStorage.getItem('token');
  const response = await api.get('/promotions/flash-sales', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const getPromotionById = async (id: string): Promise<Promotion> => {
  const response = await api.get(`/promotions/${id}`);
  return response.data;
};

export const createPromotion = async (promotionData: Partial<Promotion>) => {
  const response = await api.post('/promotions', promotionData);
  return response.data;
};

export const updatePromotion = async (id: string, promotionData: Partial<Promotion>) => {
  const response = await api.patch(`/promotions/${id}`, promotionData);
  return response.data;
};

export const deletePromotion = async (id: string) => {
  return await api.delete(`/promotions/${id}`);
};

export const togglePromotionStatus = async (id: string, isActive: boolean) => {
  const response = await api.patch(`/promotions/${id}/toggle`, { isActive });
  return response.data;
};

// 12. Reviews
export const getReviewsByProduct = async (productId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (reviewData: Review) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// ---------------------------------------------------------
// ✅ 13. Bookmarks (สินค้าที่สนใจ)
// ---------------------------------------------------------
export const getBookmarks = async () => {
  const response = await api.get('/bookmarks');
  return response.data;
};

export const addBookmark = async (productId: string) => {
  const response = await api.post('/bookmarks', { productId });
  return response.data;
};

export const removeBookmark = async (productId: string) => {
  return await api.delete(`/bookmarks/${productId}`);
};
// เพิ่มฟังก์ชันสำหรับขอเปลี่ยน Email
export const requestEmailChange = async (data: { currentPassword: string; newEmail: string }) => {
  const response = await api.post('/users/change-email-request', data);
  return response.data;
};

// เพิ่มฟังก์ชันสำหรับขอเปลี่ยน Password
export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const response = await api.post('/users/change-password', data);
  return response.data;
};

export const verifyEmailChange = async (token: string) => {
  const response = await api.post('/users/verify-email', { token });
  return response.data;
};

// เพิ่มฟังก์ชันดึงสินค้าแบบรับหน้า
export const getProducts = async (page: number = 1, limit: number = 12) => {
  const response = await api.get(`/products?page=${page}&limit=${limit}`);
  return response.data;
};
export default api;