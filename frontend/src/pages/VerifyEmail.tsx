import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('ไม่พบ Token สำหรับยืนยันอีเมล');
      return;
    }

    const verify = async () => {
      try {
        await api.verifyEmailChange(token);
        setStatus('success');
        setMessage('ยืนยันการเปลี่ยนอีเมลสำเร็จ! คุณสามารถใช้อีเมลใหม่ทำรายการได้เลย');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'ลิงก์ยืนยันไม่ถูกต้อง หรือหมดอายุแล้ว');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] p-4 font-sans">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-md w-full text-center border border-gray-100">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6">
            <Loader size={56} className="animate-spin text-[#148F96] mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">กำลังตรวจสอบข้อมูล...</h2>
            <p className="text-slate-500 mt-2">กรุณารอสักครู่ ระบบกำลังยืนยันความถูกต้อง</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3">สำเร็จ!</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>
            <Link to="/profile" className="w-full py-3.5 bg-[#148F96] hover:bg-[#0f6f75] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#148F96]/20">
              กลับไปหน้าโปรไฟล์
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3">เกิดข้อผิดพลาด</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>
            <Link to="/profile" className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">
              กลับไปทำรายการใหม่
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;