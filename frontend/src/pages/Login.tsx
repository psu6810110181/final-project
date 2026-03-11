import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/HomeAlright_logo.webp';
import toast from 'react-hot-toast'; // ✅ นำเข้า toast

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(formData);
      await fetchCart();
      toast.success('เข้าสู่ระบบสำเร็จ!'); // ✅ แจ้งเตือนเมื่อสำเร็จ
      
      // Check if user is admin and redirect accordingly
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'); // ✅ เปลี่ยนจาก alert
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ฝั่งซ้าย: รูปภาพและข้อความ */}
      <div className="hidden lg:flex lg:w-3/4 relative">
        <img 
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1974" 
          alt="Interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-20">
          <h1 className="text-white text-4xl font-bold leading-tight max-w-2xl">
            "สร้างพื้นที่ส่วนตัวที่สมบูรณ์แบบของคุณ <br />
            ทุกสิ่งที่คุณต้องการเพื่อเปลี่ยนบ้านให้เป็นที่อยู่อาศัยที่อบอุ่น"
          </h1>
          <p className="text-gray-200 mt-4">homealright.com</p>
        </div>
      </div>

      {/* ฝั่งขวา: ฟอร์ม (พื้นหลังสีฟ้าอ่อน) */}
      <div className="w-full lg:w-1/4 bg-[#99C4C8] flex items-center justify-center p-8">
        <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-xl flex flex-col items-center">
          
          <img 
            src={logoImg} 
            alt="HomeAlright Logo" 
            className="w-24 h-24 rounded-full border-[3px] border-[#04A5E3] bg-white object-contain p-2 shadow-sm mb-4"
          />
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ลงชื่อเข้าใช้</h2>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input 
              type="text" placeholder="ชื่อผู้ใช้" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <input 
              type="password" placeholder="รหัสผ่าน" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <div className="flex items-center gap-2 px-2">
              <input type="checkbox" id="remember" className="rounded" />
              <label htmlFor="remember" className="text-xs text-gray-500">จดจำฉัน</label>
            </div>

            <button type="submit" className="w-full bg-[#D65A31] text-white py-3 rounded-full font-bold shadow-lg hover:bg-[#b54622] transition">
              ลงชื่อเข้าใช้
            </button>

            <div className="flex items-center gap-2 w-full">
              <hr className="flex-1 border-gray-300" />
              <span className="text-xs text-gray-400">หรือ</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-full font-bold hover:bg-gray-50 transition text-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs">
            <p className="text-gray-500">ยังไม่มีบัญชีผู้ใช้? <Link to="/register" className="text-blue-500 font-bold">สมัครสมาชิก</Link></p>
            <p className="text-gray-400">ลืมรหัสผ่านใช่ไหม? <Link to="/forgot-password" className="text-blue-500 cursor-pointer font-bold">กดที่นี่</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;