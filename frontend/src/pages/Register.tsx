import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/HomeAlright_logo.webp';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast'; // ✅ นำเข้า toast

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false); 
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRules = {
    length: formData.password.length >= 12,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    specialChar: /[!@#$%^&*-_]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isPasswordMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPolicyAccepted) {
      toast.error('กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ'); // ✅
      return;
    }

    if (!isPasswordValid) {
      toast.error('กรุณาตั้งรหัสผ่านให้ตรงตามเงื่อนไขความปลอดภัยที่กำหนด'); // ✅
      return;
    }
    
    if (!isPasswordMatch) {
      toast.error('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'); // ✅
      return;
    }

    try {
      await register(formData);
      toast.success('สมัครสมาชิกสำเร็จ!'); // ✅
      navigate('/login');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการสมัครสมาชิก'); // ✅
    }
  };

  const RuleItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isValid ? 'text-green-600' : 'text-red-500'}`}>
      {isValid ? <Check size={14} className="stroke-[3]" /> : <X size={14} className="stroke-[3]" />}
      <span>{text}</span>
    </div>
  );

  return (
    // ... ส่วน UI คงเดิม ไม่มีการเปลี่ยนแปลง
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
            "ยกระดับประสบการณ์การใช้ชีวิตของคุณ"
          </h1>
          <p className="text-gray-200 mt-4">homealright.com</p>
        </div>
      </div>

      {/* ฝั่งขวา: ฟอร์ม */}
      <div className="w-full lg:w-1/4 bg-[#99C4C8] flex items-center justify-center p-8 overflow-y-auto">
        <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-xl flex flex-col items-center my-auto">
          
          <img 
            src={logoImg} 
            alt="HomeAlright Logo" 
            className="w-24 h-24 rounded-full border-[3px] border-[#04A5E3] bg-white object-contain p-2 shadow-sm mb-4 shrink-0"
          />

          <h2 className="text-2xl font-bold text-gray-800 mb-6">ลงทะเบียน</h2>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <input 
              type="email" placeholder="อีเมล" required
              className="w-full p-3 bg-gray-50 border rounded-full outline-none focus:ring-2 focus:ring-orange-500" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
            <input 
              type="text" placeholder="ชื่อผู้ใช้" required
              className="w-full p-3 bg-gray-50 border rounded-full outline-none focus:ring-2 focus:ring-orange-500" 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
            <input 
              type="password" placeholder="รหัสผ่าน" required
              className={`w-full p-3 bg-gray-50 border rounded-full outline-none focus:ring-2 focus:ring-orange-500 ${formData.password && !isPasswordValid ? 'border-red-300' : ''}`} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />

            <div className="w-full bg-gray-50/80 p-3 rounded-2xl border border-gray-100 text-xs flex flex-col gap-1.5 shadow-sm">
              <p className="font-bold text-gray-700 mb-1">ความปลอดภัยของรหัสผ่าน:</p>
              <RuleItem isValid={passwordRules.length} text="ควรมีความยาวอย่างน้อย 12 ตัวอักษร" />
              <RuleItem isValid={passwordRules.uppercase} text="อักษรตัวพิมพ์ใหญ่ (A-Z)" />
              <RuleItem isValid={passwordRules.lowercase} text="อักษรตัวพิมพ์เล็ก (a-z)" />
              <RuleItem isValid={passwordRules.number} text="ตัวเลข (0-9)" />
              <RuleItem isValid={passwordRules.specialChar} text="สัญลักษณ์พิเศษ (! @ # $ % ^ & * - _)" />
            </div>

            <div className="space-y-1">
              <input 
                type="password" placeholder="ยืนยันรหัสผ่าน" required
                className={`w-full p-3 bg-gray-50 border rounded-full outline-none focus:ring-2 focus:ring-orange-500 ${formData.confirmPassword && !isPasswordMatch ? 'border-red-500 focus:ring-red-500' : ''}`} 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              />
              {formData.confirmPassword && !isPasswordMatch && (
                <p className="text-red-500 text-xs px-3 py-1 font-medium">รหัสผ่านไม่ตรงกัน</p>
              )}
            </div>

            <div className="flex items-start gap-2 px-2 pt-2">
              <input 
                type="checkbox" 
                id="policy" 
                required
                checked={isPolicyAccepted}
                onChange={(e) => setIsPolicyAccepted(e.target.checked)}
                className="mt-1 cursor-pointer accent-[#D65A31]" 
              />
              <label htmlFor="policy" className="text-xs text-gray-600 leading-tight">
                ฉันยอมรับ
                <Link to="/policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 font-bold underline mx-1">
                  นโยบายความเป็นส่วนตัว
                </Link>
                ของทางเว็บไซต์
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={!isPolicyAccepted || !formData.password || !isPasswordValid || !isPasswordMatch} 
              className="w-full bg-[#D65A31] text-white py-3 rounded-full font-bold mt-4 shadow-lg hover:bg-[#b54622] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ลงทะเบียน
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500">
            มีบัญชีผู้ใช้แล้ว? <Link to="/login" className="text-blue-500 font-bold underline">ลงชื่อเข้าใช้</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;