import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import Navbar เข้ามา

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import Review from './pages/Review';
import Policy from './pages/Policy';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar วางไว้ตรงนี้เพื่อให้แสดงทุกหน้า */}
      <Navbar /> 
      
      <div className="container mx-auto mt-4"> {/* เพิ่ม Container เพื่อจัดระเบียบเนื้อหา */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/review" element={<Review />} />
          <Route path="/policy" element={<Policy />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;