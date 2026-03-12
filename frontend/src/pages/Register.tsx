import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/HomeAlright_logo.webp';
import { Check, X, Mail, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import loginbackground from '../assets/login.jpeg'; 

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false); 
  const [isVisible, setIsVisible] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const passwordRules = {
    length: formData.password.length >= 12,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    // ✅ แก้ไข Regex: ใส่ \- เพื่อไม่ให้ระบบมองเป็น Range
    specialChar: /[!@#$%^&*_\-]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPolicyAccepted) {
      toast.error('กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ');
      return;
    }
    if (!isPasswordValid) {
      toast.error('กรุณาตั้งรหัสผ่านให้ตรงตามเงื่อนไขความปลอดภัยที่กำหนด');
      return;
    }
    if (!isPasswordMatch) {
      toast.error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      await register(formData);
      toast.success('สมัครสมาชิกสำเร็จ!');
      navigate('/login');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  // ✅ ปรับ UI เงื่อนไข: ถ้าเริ่มพิมพ์แล้วยังไม่ผ่านให้เป็นสีแดง ถ้าผ่านแล้วเป็นสีเขียว
  const RuleItem = ({ isValid, text }: { isValid: boolean, text: string }) => {
    const hasInput = formData.password.length > 0;
    const textColor = !hasInput ? 'text-slate-400' : (isValid ? 'text-emerald-500' : 'text-red-500');
    
    return (
      <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors duration-300 ${textColor}`}>
        {!hasInput ? (
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1"/>
        ) : isValid ? (
          <Check size={14} className="stroke-[3]" />
        ) : (
          <X size={14} className="stroke-[3]" />
        )}
        <span>{text}</span>
      </div>
    );
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
          <div className="w-16 h-1.5 bg-[#D65A31] mb-6 shadow-lg"></div>
          <h1 className="text-white text-5xl font-extrabold leading-tight max-w-2xl drop-shadow-2xl tracking-tight mb-4">
            เริ่มต้นประสบการณ์ <br/>
            การใช้ชีวิต <span className="text-[#D65A31]">เหนือระดับ</span>
          </h1>
          <p className="text-slate-100 text-xl font-medium max-w-xl leading-relaxed drop-shadow-md">
            สมัครสมาชิกวันนี้ เพื่อรับสิทธิพิเศษและติดตามออเดอร์ของคุณได้อย่างง่ายดาย
          </p>
        </div>
      </div>

      {/* --- ฝั่งขวา: Light Cinematic Form Panel --- */}
      <div className="w-full lg:w-1/3 relative flex items-center justify-center p-6 md:p-8 bg-white z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] overflow-y-auto custom-scrollbar">
        
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#D65A31]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className={`w-full max-w-sm transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'} my-auto py-8`}>
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <img 
              src={logoImg} 
              alt="HomeAlright Logo" 
              className="w-24 h-24 rounded-full border-4 border-white bg-white object-contain p-2 shadow-xl mb-4"
            />
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">สร้างบัญชีใหม่</h2>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-10">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400 group-focus-within:text-[#D65A31] transition-colors" />
              </div>
              <input 
                type="email" placeholder="อีเมล" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#D65A31]/20 focus:border-[#D65A31] text-slate-800 placeholder:text-slate-400 transition-all font-medium shadow-sm" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400 group-focus-within:text-[#D65A31] transition-colors" />
              </div>
              <input 
                type="text" placeholder="ชื่อผู้ใช้" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#D65A31]/20 focus:border-[#D65A31] text-slate-800 placeholder:text-slate-400 transition-all font-medium shadow-sm" 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
              />
            </div>

            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-[#D65A31] transition-colors" />
                </div>
                <input 
                  type="password" placeholder="รหัสผ่าน" required
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:ring-4 transition-all font-medium shadow-sm text-slate-800 placeholder:text-slate-400
                    ${formData.password && !isPasswordValid ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#D65A31]/20 focus:border-[#D65A31]'}
                  `} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              {/* Password Rules Box */}
              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5 shadow-inner mt-2">
                <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">ความปลอดภัยของรหัสผ่าน:</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                  <RuleItem isValid={passwordRules.length} text="ยาว 12 ตัวอักษรขึ้นไป" />
                  <RuleItem isValid={passwordRules.uppercase} text="พิมพ์ใหญ่ (A-Z)" />
                  <RuleItem isValid={passwordRules.lowercase} text="พิมพ์เล็ก (a-z)" />
                  <RuleItem isValid={passwordRules.number} text="ตัวเลข (0-9)" />
                  <div className="col-span-2">
                    <RuleItem isValid={passwordRules.specialChar} text="สัญลักษณ์ (!@#$%^&*-_)" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-[#D65A31] transition-colors" />
                </div>
                <input 
                  type="password" placeholder="ยืนยันรหัสผ่าน" required
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:ring-4 transition-all font-medium shadow-sm text-slate-800 placeholder:text-slate-400
                    ${formData.confirmPassword && !isPasswordMatch ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#D65A31]/20 focus:border-[#D65A31]'}
                  `} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
              
              {/* ✅ เพิ่มข้อความแจ้งเตือนรหัสผ่านตรงกัน (เหมือนหน้า Profile) */}
              {formData.confirmPassword && !isPasswordMatch && (
                <p className="text-red-500 text-xs mt-1.5 px-1 flex items-center gap-1"><AlertCircle size={12}/> รหัสผ่านไม่ตรงกัน</p>
              )}
              {formData.confirmPassword && isPasswordMatch && (
                <p className="text-emerald-500 text-xs mt-1.5 px-1 flex items-center gap-1"><Check size={12}/> รหัสผ่านตรงกัน</p>
              )}
            </div>

            <div className="flex items-start gap-2 px-1 pt-2">
              <input 
                type="checkbox" 
                id="policy" 
                required
                checked={isPolicyAccepted}
                onChange={(e) => setIsPolicyAccepted(e.target.checked)}
                className="mt-1 cursor-pointer w-4 h-4 rounded border-gray-300 text-[#D65A31] focus:ring-[#D65A31]" 
              />
              <label htmlFor="policy" className="text-xs text-slate-600 font-medium leading-relaxed cursor-pointer">
                ฉันยอมรับ
                <Link to="/policy" target="_blank" rel="noopener noreferrer" className="text-[#148F96] hover:text-[#107378] font-bold underline mx-1 transition-colors">
                  นโยบายความเป็นส่วนตัว
                </Link>
                ของเว็บไซต์
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={!isPolicyAccepted || !formData.password || !isPasswordValid || !isPasswordMatch} 
              className="w-full bg-[#D65A31] hover:bg-[#b54622] text-white py-4 rounded-xl font-black text-base flex justify-center items-center gap-2 mt-4 shadow-lg shadow-[#D65A31]/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              สมัครสมาชิก <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-slate-500 font-medium relative z-10">
            มีบัญชีผู้ใช้แล้ว? 
            <Link to="/login" className="text-[#D65A31] font-bold hover:text-[#b54622] transition-colors ml-2 border-b-2 border-transparent hover:border-[#D65A31] pb-0.5">
              ลงชื่อเข้าใช้
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;