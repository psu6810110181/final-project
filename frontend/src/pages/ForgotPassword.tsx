import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ปรับ URL API ตามจริง
      await axios.post('http://localhost:3000/auth/forgot-password', { email });
      toast.success('ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">ลืมรหัสผ่าน</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">กรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์เพื่อตั้งค่ารหัสผ่านใหม่ไปให้</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="อีเมลของคุณ" 
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white py-3 rounded-full font-bold shadow-lg transition ${loading ? 'bg-gray-400' : 'bg-[#D65A31] hover:bg-[#b54622]'}`}
          >
            {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => navigate('/login')} className="text-blue-500 text-sm font-bold">กลับไปหน้าเข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;