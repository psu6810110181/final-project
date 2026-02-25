import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import OrderHistory from './pages/OrderHistory';
import Review from './pages/Review'; // ✅ 1. Import หน้า Review เข้ามา
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Policy from './pages/Policy';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter> {/* ✅ 1. เอา Router ไว้บนสุด */}
      <AuthProvider> {/* ✅ 2. AuthProvider ครอบทุกอย่าง */}
        <CartProvider> {/* ✅ 3. CartProvider อยู่ข้างในเพื่อให้ดึง Token จาก Auth มาใช้ได้ */}
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            }} 
          />
          <Navbar /> 
          <div className="min-h-screen bg-gray-50">
            <Routes>  
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} /> {/* เพิ่ม path ว่างไว้ด้วยกันหน้าขาวเวลาเข้าเว็บ */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* ✅ 2. เพิ่ม Route สำหรับ Review */}
              <Route path="/review" element={<Review />} />
              
              {/* 💡 Note: หากในอนาคตต้องการให้ลิงก์รีวิวผูกกับ ID สินค้าแต่ละชิ้นโดยเฉพาะ 
                  สามารถเปลี่ยนเป็น <Route path="/review/:productId" element={<Review />} /> ได้ครับ */}
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;