import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/HomeAlright_logo.webp';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

import loginbackground from '../assets/login.jpeg'; 

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(formData);
      await fetchCart();
      toast.success('เข้าสู่ระบบสำเร็จ!');
      
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      
      {/* --- ฝั่งซ้าย: Cinematic Image --- */}
      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-slate-900/30 mix-blend-multiply z-10 pointer-events-none" />
        
        <img 
          src={loginbackground} 
          alt="Interior" 
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        
        <div className={`absolute bottom-20 left-20 z-20 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="w-16 h-1.5 bg-[#148F96] mb-6 shadow-lg"></div>
          <h1 className="text-white text-5xl font-extrabold leading-tight max-w-2xl drop-shadow-2xl tracking-tight mb-4">
            สร้างพื้นที่ส่วนตัวที่ <br/>
            <span className="text-[#1fd4de]">สมบูรณ์แบบ</span> ของคุณ
          </h1>
          <p className="text-slate-100 text-xl font-medium max-w-xl leading-relaxed drop-shadow-md">
            ทุกสิ่งที่คุณต้องการเพื่อเปลี่ยนบ้าน ให้เป็นที่อยู่อาศัยที่อบอุ่นและมีสไตล์
          </p>
        </div>
      </div>

      {/* --- ฝั่งขวา: Light Cinematic Form Panel --- */}
      <div className="w-full lg:w-1/3 relative flex items-center justify-center p-8 bg-white z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.05)]">
        
        {/* Decorative Light Glow */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#148F96]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className={`w-full max-w-sm transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
          
          <div className="flex flex-col items-center mb-10">
            <img 
              src={logoImg} 
              alt="HomeAlright Logo" 
              className="w-28 h-28 rounded-full border-4 border-white bg-white object-contain p-2 shadow-xl relative z-10"
            />
            <h2 className="text-3xl font-extrabold text-slate-800 mt-6 tracking-tight">ยินดีต้อนรับกลับมา</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail size={20} className="text-slate-400 group-focus-within:text-[#148F96] transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="ชื่อผู้ใช้" 
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#148F96]/20 focus:border-[#148F96] text-slate-800 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={20} className="text-slate-400 group-focus-within:text-[#148F96] transition-colors" />
              </div>
              <input 
                type="password" 
                placeholder="รหัสผ่าน" 
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-[#148F96]/20 focus:border-[#148F96] text-slate-800 placeholder:text-slate-400 transition-all font-medium shadow-sm"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer font-medium hover:text-slate-800">จดจำฉัน</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#D65A31] hover:text-[#b54622] transition-colors font-bold">ลืมรหัสผ่าน?</Link>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#148F96] hover:bg-[#107378] text-white py-4 rounded-2xl font-black text-lg flex justify-center items-center gap-2 shadow-lg shadow-[#148F96]/30 transition-all active:scale-95 mt-4"
            >
              เข้าสู่ระบบ <ArrowRight size={20} />
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

          <div className="mt-8 text-center text-sm relative z-10">
            <p className="text-slate-500 font-medium">
              ยังไม่มีบัญชีผู้ใช้? 
              <Link to="/register" className="text-[#148F96] font-bold hover:text-[#107378] transition-colors ml-1 border-b-2 border-transparent hover:border-[#148F96] pb-0.5">
                สมัครสมาชิกเลย
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;