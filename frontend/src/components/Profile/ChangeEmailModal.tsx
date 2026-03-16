// frontend/src/components/Profile/ChangeEmailModal.tsx
import React, { useState } from 'react';
import { Mail, X, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

interface ChangeEmailModalProps {
  onClose: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ currentPassword: '', newEmail: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newEmail) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsSaving(true);
    try {
      // เรียกใช้ API ตามเดิม
      await (api as any).requestEmailChange({
        currentPassword: form.currentPassword,
        newEmail: form.newEmail
      });
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง หรือเกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a4d52]/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Mail className="text-[#5aa8ad]" /> เปลี่ยนอีเมล
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <input 
                    type={showCurrentPwd ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5aa8ad]/50 focus:border-[#5aa8ad] outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                    {showCurrentPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">อีเมลใหม่ที่ต้องการเปลี่ยน</label>
                <input 
                  type="email"
                  value={form.newEmail}
                  onChange={(e) => setForm({...form, newEmail: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5aa8ad]/50 focus:border-[#5aa8ad] outline-none transition-all"
                  placeholder="newemail@example.com"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3.5 bg-[#5aa8ad] hover:bg-[#148F96] text-white rounded-xl font-bold transition-all mt-4 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-[#5aa8ad]/30"
              >
                {isSaving ? 'กำลังดำเนินการ...' : <>ดำเนินการต่อ <ArrowRight size={18}/></>}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-cyan-50 text-[#5aa8ad] border border-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">ตรวจสอบกล่องจดหมายของคุณ</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                ระบบได้ส่งลิงก์ยืนยันไปยัง <span className="font-bold text-[#5aa8ad]">{form.newEmail}</span> แล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อเสร็จสิ้นการเปลี่ยนอีเมล
              </p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
              >
                รับทราบและปิดหน้าต่าง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeEmailModal;