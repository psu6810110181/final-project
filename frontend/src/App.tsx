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
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Policy from './pages/Policy';
import { Toaster } from 'react-hot-toast';
import ReviewPage from './pages/Review';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import HomepagePromotion from './pages/HomepagePromotion'; // นำเข้าหน้าใหม่

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
              <Route path="/promotions" element={<HomepagePromotion />} />
              <Route path="/" element={<Home />} /> {/* เพิ่ม path ว่างไว้ด้วยกันหน้าขาวเวลาเข้าเว็บ */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              {/* ✅ เปลี่ยนมาใช้ ReviewPage ตามฝั่ง UX/UI */}
              <Route path="/review" element={<ReviewPage />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;