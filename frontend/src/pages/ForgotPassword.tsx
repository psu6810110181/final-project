import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, KeyRound, ArrowLeft, Loader } from 'lucide-react';

import heroBackground from '../assets/background.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success('ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans bg-[#F8FAFA]">
      
      {/* --- Light Cinematic Background --- */}
      <div className="absolute inset-0 bg-white/70 z-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-[#F8FAFA] z-10" />
      <img 
        src={heroBackground} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-60 blur-[2px]"
      />
      
      {/* Light Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#148F96]/15 blur-[120px] rounded-full z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-400/10 blur-[120px] rounded-full z-10 pointer-events-none" />

      {/* --- Light Glassmorphism Card --- */}
      <div className={`relative z-20 bg-white/80 backdrop-blur-2xl border border-white p-8 md:p-12 rounded-[3rem] w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        <div className="flex justify-center mb-6">
          <div className="bg-slate-50 p-5 rounded-full border border-slate-100 shadow-inner">
            <KeyRound size={36} className="text-[#148F96]" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 mb-3 text-center tracking-wide">ลืมรหัสผ่าน?</h2>
        <p className="text-sm text-slate-500 mb-8 text-center font-medium leading-relaxed">
          ไม่ต้องกังวล เพียงกรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์เพื่อตั้งค่ารหัสผ่านใหม่ไปให้คุณทันที
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail size={20} className="text-slate-400 group-focus-within:text-[#148F96] transition-colors" />
            </div>
            <input 
              type="email" 
              placeholder="อีเมลของคุณ" 
              required
              className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#148F96]/20 focus:border-[#148F96] text-slate-800 placeholder:text-slate-400 transition-all font-medium shadow-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${loading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#D65A31] hover:bg-[#b54622] text-white shadow-lg shadow-[#D65A31]/30 hover:shadow-xl'}`}
          >
            {loading ? <Loader className="animate-spin" size={24} /> : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/login')} 
            className="text-slate-500 hover:text-[#148F96] text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft size={16} /> กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;