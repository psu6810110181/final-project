// frontend/src/components/Profile/ChangePasswordModal.tsx
import React, { useState } from 'react';
import { Key, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const pwdReq = {
    length: form.newPassword.length >= 12,
    uppercase: /[A-Z]/.test(form.newPassword),
    lowercase: /[a-z]/.test(form.newPassword),
    number: /[0-9]/.test(form.newPassword),
    specialChar: /[!@#$%^&*_\-]/.test(form.newPassword),
  };
  const isNewPwdValid = Object.values(pwdReq).every(Boolean);
  const isPwdMatch = form.newPassword === form.confirmPassword && form.newPassword !== '';

  const getRuleColor = (isValid: boolean) => {
    if (form.newPassword.length === 0) return 'text-slate-400';
    return isValid ? 'text-[#5aa8ad]' : 'text-red-500';
  };

  const getRuleIcon = (isValid: boolean) => {
    if (form.newPassword.length === 0) return <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1"/>;
    return isValid ? <Check size={14} className="stroke-[3]"/> : <X size={14} className="stroke-[3]"/>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword) { toast.error('กรุณากรอกรหัสผ่านปัจจุบัน'); return; }
    if (!isNewPwdValid) { toast.error('รหัสผ่านใหม่ยังไม่ตรงตามเงื่อนไข'); return; }
    if (!isPwdMatch) { toast.error('รหัสผ่านใหม่ทั้ง 2 ช่องไม่ตรงกัน'); return; }

    setIsSaving(true);
    try {
      await (api as any).changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด หรือรหัสผ่านปัจจุบันไม่ถูกต้อง');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a4d52]/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Key className="text-[#5aa8ad]" /> เปลี่ยนรหัสผ่าน
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
              <div className="relative">
                <input 
                  type={showCurrentPwd ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5aa8ad]/50 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                  {showCurrentPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-4"></div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านใหม่</label>
              <div className="relative">
                <input 
                  type={showNewPwd ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) => setForm({...form, newPassword: e.target.value})}
                  className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${form.newPassword && !isNewPwdValid ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#5aa8ad]/50'}`}
                />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                  {showNewPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl mt-2 border border-slate-100">
                <p className="text-xs font-bold text-[#5aa8ad] mb-2">รหัสผ่านต้องประกอบด้วย:</p>
                <ul className="text-xs space-y-1.5">
                  <li className={`flex items-center gap-2 ${getRuleColor(pwdReq.length)}`}>{getRuleIcon(pwdReq.length)} อย่างน้อย 12 ตัวอักษร</li>
                  <li className={`flex items-center gap-2 ${getRuleColor(pwdReq.uppercase)}`}>{getRuleIcon(pwdReq.uppercase)} ตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว</li>
                  <li className={`flex items-center gap-2 ${getRuleColor(pwdReq.lowercase)}`}>{getRuleIcon(pwdReq.lowercase)} ตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว</li>
                  <li className={`flex items-center gap-2 ${getRuleColor(pwdReq.number)}`}>{getRuleIcon(pwdReq.number)} ตัวเลข (0-9) อย่างน้อย 1 ตัว</li>
                  <li className={`flex items-center gap-2 ${getRuleColor(pwdReq.specialChar)}`}>{getRuleIcon(pwdReq.specialChar)} อักขระพิเศษ (!@#$%^&*-_) 1 ตัว</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <input 
                  type={showConfirmPwd ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all ${form.confirmPassword && !isPwdMatch ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#5aa8ad]/50'}`}
                />
                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                  {showConfirmPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              {form.confirmPassword && !isPwdMatch && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> รหัสผ่านไม่ตรงกัน</p>
              )}
              {form.confirmPassword && isPwdMatch && (
                <p className="text-[#5aa8ad] text-xs mt-1.5 flex items-center gap-1"><Check size={12}/> รหัสผ่านตรงกัน</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSaving || !isNewPwdValid || !isPwdMatch}
              className="w-full py-3.5 bg-[#5aa8ad] hover:bg-[#148F96] text-white rounded-xl font-bold transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#5aa8ad]/30"
            >
              {isSaving ? 'กำลังบันทึก...' : <>บันทึกการเปลี่ยนแปลง</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;