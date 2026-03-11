import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('รหัสผ่านไม่ตรงกัน');
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ตั้งค่ารหัสผ่านใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="รหัสผ่านใหม่" 
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="ยืนยันรหัสผ่านใหม่" 
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white py-3 rounded-full font-bold shadow-lg transition ${loading ? 'bg-gray-400' : 'bg-[#D65A31] hover:bg-[#b54622]'}`}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;