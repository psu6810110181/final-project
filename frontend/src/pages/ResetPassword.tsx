import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2, Loader } from 'lucide-react';

import heroBackground from '../assets/background.jpg';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('รหัสผ่านไม่ตรงกัน');
    }
    if (password.length < 6) {
      return toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/auth/reset-password/${token}`, { password });
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans bg-[#F8FAFA]">
      
      {/* --- Light Cinematic Background --- */}
      <div className="absolute inset-0 bg-white/70 z-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFA] via-white/80 to-white/40 z-10" />
      <img 
        src={heroBackground} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-60 blur-[2px]" 
      />
      
      {/* Light Glowing Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-400/10 blur-[150px] rounded-full z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#148F96]/15 blur-[150px] rounded-full z-10 pointer-events-none" />

      {/* --- Light Glassmorphism Card --- */}
      <div className={`relative z-20 bg-white/80 backdrop-blur-2xl border border-white p-8 md:p-12 rounded-[3rem] w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        <div className="flex justify-center mb-6">
          <div className="bg-slate-50 p-5 rounded-full border border-slate-100 shadow-inner">
            <Lock size={36} className="text-[#148F96]" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 text-center tracking-wide">ตั้งค่ารหัสผ่านใหม่</h2>
        <p className="text-sm text-slate-500 mb-8 text-center font-medium leading-relaxed">
          กรุณากำหนดรหัสผ่านใหม่ของคุณเพื่อใช้ในการเข้าสู่ระบบครั้งต่อไป
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock size={20} className="text-slate-400 group-focus-within:text-[#148F96] transition-colors" />
            </div>
            <input 
              type="password" 
              placeholder="รหัสผ่านใหม่" 
              required
              className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#148F96]/20 focus:border-[#148F96] text-slate-800 placeholder:text-slate-400 transition-all font-medium tracking-widest shadow-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <CheckCircle2 size={20} className="text-slate-400 group-focus-within:text-[#148F96] transition-colors" />
            </div>
            <input 
              type="password" 
              placeholder="ยืนยันรหัสผ่านใหม่" 
              required
              className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#148F96]/20 focus:border-[#148F96] text-slate-800 placeholder:text-slate-400 transition-all font-medium tracking-widest shadow-sm"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${loading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#148F96] hover:bg-[#107378] text-white shadow-lg shadow-[#148F96]/30 hover:shadow-xl'}`}
            >
              {loading ? <Loader className="animate-spin text-white" size={24} /> : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;