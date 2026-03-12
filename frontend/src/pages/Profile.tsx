import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api'; 
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Edit3, Check, X, Star, Key, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Camera } from 'lucide-react';
import heroBackground from '../assets/background.jpg';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  userImage?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' });
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [showEmailCurrentPwd, setShowEmailCurrentPwd] = useState(false);

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isPwdSaving, setIsPwdSaving] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const fetchProfileData = async () => {
    try {
      const data = await api.getProfile(); 
      setProfile(data);
    } catch (error) {
      if (user) {
        setProfile({
          id: user.id || '',
          username: user.username || 'Unknown',
          email: '', 
          role: user.role || 'user',
        } as UserProfile);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsVisible(true), 100);
    }
  };

  const getAvatarUrl = (img?: string) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API_BASE_URL}/uploads/profiles/${img}`; 
  };

  const handleEditClick = () => {
    setEditData({ phone: profile?.phone || '', address: profile?.address || '' });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('phone', editData.phone);
      formData.append('address', editData.address);
      if (selectedImage) formData.append('file', selectedImage);

      await api.updateProfile(formData);
      await fetchProfileData();
      setIsEditing(false);
      setSelectedImage(null);
      setPreviewImage(null);
      toast.success('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง'); 
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.currentPassword || !emailForm.newEmail) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsEmailSaving(true);
    try {
      await (api as any).requestEmailChange({
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail
      });
      setEmailStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง หรือเกิดข้อผิดพลาด');
    } finally {
      setIsEmailSaving(false);
    }
  };

  // ✅ แก้ไข Regex ในส่วนของรหัสผ่าน
  const pwdReq = {
    length: pwdForm.newPassword.length >= 12,
    uppercase: /[A-Z]/.test(pwdForm.newPassword),
    lowercase: /[a-z]/.test(pwdForm.newPassword),
    number: /[0-9]/.test(pwdForm.newPassword),
    specialChar: /[!@#$%^&*_\-]/.test(pwdForm.newPassword),
  };
  const isNewPwdValid = Object.values(pwdReq).every(Boolean);
  const isPwdMatch = pwdForm.newPassword === pwdForm.confirmPassword && pwdForm.newPassword !== '';

  const handlePwdChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdForm.currentPassword) { toast.error('กรุณากรอกรหัสผ่านปัจจุบัน'); return; }
    if (!isNewPwdValid) { toast.error('รหัสผ่านใหม่ยังไม่ตรงตามเงื่อนไข'); return; }
    if (!isPwdMatch) { toast.error('รหัสผ่านใหม่ทั้ง 2 ช่องไม่ตรงกัน'); return; }

    setIsPwdSaving(true);
    try {
      await (api as any).changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      setShowPwdModal(false);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด หรือรหัสผ่านปัจจุบันไม่ถูกต้อง');
    } finally {
      setIsPwdSaving(false);
    }
  };

  // ✅ ปรับเงื่อนไขสี: ไม่พิมพ์=เทา, พิมพ์แต่ผิด=แดง, ผ่าน=เขียว
  const getRuleColor = (isValid: boolean) => {
    if (pwdForm.newPassword.length === 0) return 'text-slate-400';
    return isValid ? 'text-[#5aa8ad]' : 'text-red-500';
  };
  const getRuleIcon = (isValid: boolean) => {
    if (pwdForm.newPassword.length === 0) return <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1"/>;
    return isValid ? <Check size={14} className="stroke-[3]"/> : <X size={14} className="stroke-[3]"/>;
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[80vh] bg-[#F8FAFA]"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#148F96]"></div></div>;
  if (!profile) return <div className="flex justify-center items-center min-h-[80vh] text-slate-500 text-lg bg-[#F8FAFA]">ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง</div>;

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative overflow-hidden font-sans pt-10">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a4d52]/60 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFA] via-[#F8FAFA]/90 to-transparent z-10" />
        <img src={heroBackground} alt="Background" className="absolute inset-0 w-full h-full object-cover scale-105" />
      </div>

      <div className="absolute top-[-20%] left-1/4 w-[600px] h-[600px] bg-[#5aa8ad]/30 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#148F96]/20 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className={`relative z-10 container mx-auto px-4 max-w-4xl transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-[#5aa8ad]/20 border border-white/80 overflow-hidden relative">
          
          <div className="h-48 bg-gradient-to-r from-[#5aa8ad] via-[#148F96] to-[#0a4d52] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          </div>
          
          <div className="px-8 md:px-12 pb-12">
            <div className="relative flex flex-col md:flex-row md:justify-between items-center md:items-end -mt-20 mb-10 gap-6">
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
                <div className="relative group w-40 h-40 bg-white rounded-[2rem] p-2 shadow-xl shadow-[#5aa8ad]/30 border border-white/50 mb-4 md:mb-0 transform rotate-3 hover:rotate-0 transition-all duration-500">
                  {previewImage || profile.userImage ? (
                    <img 
                      src={previewImage || getAvatarUrl(profile.userImage) as string} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-[1.5rem]" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-teal-50 text-[#5aa8ad] rounded-[1.5rem] flex items-center justify-center text-6xl font-black uppercase shadow-inner">
                      {profile.username.charAt(0)}
                    </div>
                  )}

                  {isEditing && (
                    <label className="absolute inset-2 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[1.5rem] z-20 backdrop-blur-sm border-2 border-dashed border-white/50 hover:border-white">
                      <Camera size={28} className="mb-2" />
                      <span className="text-sm font-bold">อัปโหลดรูปภาพ</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        className="hidden" 
                        onChange={handleImageChange} 
                      />
                    </label>
                  )}
                </div>

                <div className="md:ml-44 md:-mt-16">
                  <h1 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">{profile.username}</h1>
                  <p className="text-[#5aa8ad] font-bold mt-1 uppercase tracking-widest text-sm bg-cyan-50 px-3 py-1 rounded-full inline-block border border-cyan-100">
                    {profile.role} ACCOUNT
                  </p>
                </div>
              </div>
              
              <div className="z-10">
                {!isEditing ? (
                  <button 
                    onClick={handleEditClick}
                    className="px-8 py-3 bg-[#5aa8ad] hover:bg-[#148F96] text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-[#148F96]/30 flex items-center gap-2 active:scale-95"
                  >
                    <Edit3 size={18} /> แก้ไขข้อมูลทั่วไป
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <X size={18} /> ยกเลิก
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-8 py-3 bg-[#148F96] hover:bg-[#0f6f75] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#148F96]/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'กำลังบันทึก...' : <><Check size={18} /> บันทึก</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-100 to-transparent mb-10"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <User size={16} /> <span className="text-sm font-bold uppercase tracking-wider text-[#5aa8ad]">ชื่อผู้ใช้</span>
                </div>
                <div className="text-slate-800 font-medium text-lg px-2">
                  {profile.username}
                </div>
              </div>

              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Mail size={16} /> <span className="text-sm font-bold uppercase tracking-wider text-[#5aa8ad]">อีเมล</span>
                  </div>
                  <div className="text-slate-800 font-medium text-lg px-2">
                    {profile.email || '-'}
                  </div>
                </div>
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="p-3 text-[#5aa8ad] hover:text-white hover:bg-[#5aa8ad] rounded-full transition-colors tooltip relative group shadow-sm bg-white border border-cyan-50"
                  title="เปลี่ยนอีเมล"
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className={`p-5 rounded-3xl border transition-colors ${isEditing ? 'bg-white border-[#5aa8ad]/40 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Phone size={16} className={isEditing ? "text-[#5aa8ad]" : ""} /> 
                  <span className={`text-sm font-bold uppercase tracking-wider ${isEditing ? "text-[#5aa8ad]" : "text-[#5aa8ad]"}`}>เบอร์โทรศัพท์</span>
                </div>
                {!isEditing ? (
                  <div className="text-slate-800 font-medium text-lg px-2">
                    {profile.phone || <span className="text-slate-400 italic">ยังไม่ได้ระบุข้อมูล</span>}
                  </div>
                ) : (
                  <input 
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    placeholder="08X-XXX-XXXX"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5aa8ad]/50 focus:bg-white transition-all"
                  />
                )}
              </div>

              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Star size={16} /> <span className="text-sm font-bold uppercase tracking-wider text-[#5aa8ad]">สถานะบัญชี</span>
                </div>
                <div className="text-slate-800 font-black text-lg px-2 uppercase">
                  {profile.role}
                </div>
              </div>

              <div className={`md:col-span-2 p-5 rounded-3xl border transition-colors ${isEditing ? 'bg-white border-[#5aa8ad]/40 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <MapPin size={16} className={isEditing ? "text-[#5aa8ad]" : ""} /> 
                  <span className={`text-sm font-bold uppercase tracking-wider ${isEditing ? "text-[#5aa8ad]" : "text-[#5aa8ad]"}`}>ที่อยู่สำหรับจัดส่ง</span>
                </div>
                {!isEditing ? (
                  <div className="text-slate-800 font-medium text-lg px-2 leading-relaxed min-h-[60px]">
                    {profile.address || <span className="text-slate-400 italic">คุณยังไม่ได้เพิ่มที่อยู่สำหรับจัดส่งสินค้า</span>}
                  </div>
                ) : (
                  <textarea 
                    name="address"
                    value={editData.address}
                    onChange={handleInputChange}
                    placeholder="บ้านเลขที่, ถนน, ซอย, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5aa8ad]/50 focus:bg-white transition-all resize-none"
                  />
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-cyan-100/50 pt-8">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Lock size={20} className="text-[#5aa8ad]" /> ความปลอดภัยและรหัสผ่าน
               </h3>
               <button 
                  onClick={() => setShowPwdModal(true)}
                  className="px-6 py-3 bg-white border border-cyan-100 hover:border-[#5aa8ad] hover:bg-cyan-50 text-slate-700 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2 group"
                >
                  <Key size={18} className="text-[#5aa8ad] group-hover:scale-110 transition-transform"/> เปลี่ยนรหัสผ่าน (Change Password)
                </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📧 MODAL เปลี่ยนอีเมล (Change Email) */}
      {/* ========================================================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a4d52]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="text-[#5aa8ad]" /> เปลี่ยนอีเมล
                </h2>
                <button onClick={() => {setShowEmailModal(false); setEmailStep(1);}} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {emailStep === 1 ? (
                <form onSubmit={handleEmailChangeSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
                    <div className="relative">
                      <input 
                        type={showEmailCurrentPwd ? "text" : "password"}
                        value={emailForm.currentPassword}
                        onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5aa8ad]/50 focus:border-[#5aa8ad] outline-none"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowEmailCurrentPwd(!showEmailCurrentPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                        {showEmailCurrentPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">อีเมลใหม่ที่ต้องการเปลี่ยน</label>
                    <input 
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5aa8ad]/50 focus:border-[#5aa8ad] outline-none"
                      placeholder="newemail@example.com"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isEmailSaving}
                    className="w-full py-3.5 bg-[#5aa8ad] hover:bg-[#148F96] text-white rounded-xl font-bold transition-all mt-4 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-[#5aa8ad]/30"
                  >
                    {isEmailSaving ? 'กำลังดำเนินการ...' : <>ดำเนินการต่อ <ArrowRight size={18}/></>}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-cyan-50 text-[#5aa8ad] border border-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">ตรวจสอบกล่องจดหมายของคุณ</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    ระบบได้ส่งลิงก์ยืนยันไปยัง <span className="font-bold text-[#5aa8ad]">{emailForm.newEmail}</span> แล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อเสร็จสิ้นการเปลี่ยนอีเมล
                  </p>
                  <button 
                    onClick={() => {setShowEmailModal(false); setEmailStep(1); setEmailForm({currentPassword: '', newEmail: ''});}}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    รับทราบและปิดหน้าต่าง
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔑 MODAL เปลี่ยนรหัสผ่าน (Change Password) */}
      {/* ========================================================= */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a4d52]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Key className="text-[#5aa8ad]" /> เปลี่ยนรหัสผ่าน
                </h2>
                <button onClick={() => {setShowPwdModal(false); setPwdForm({currentPassword:'', newPassword:'', confirmPassword:''});}} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePwdChangeSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPwd ? "text" : "password"}
                      value={pwdForm.currentPassword}
                      onChange={(e) => setPwdForm({...pwdForm, currentPassword: e.target.value})}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5aa8ad]/50 outline-none"
                    />
                    <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                      {showCurrentPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4"></div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านใหม่</label>
                  <div className="relative">
                    <input 
                      type={showNewPwd ? "text" : "password"}
                      value={pwdForm.newPassword}
                      onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})}
                      className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 ${pwdForm.newPassword && !isNewPwdValid ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#5aa8ad]/50'}`}
                    />
                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                      {showNewPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  
                  {/* Password Rules Checklist */}
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

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPwd ? "text" : "password"}
                      value={pwdForm.confirmPassword}
                      onChange={(e) => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                      className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 ${pwdForm.confirmPassword && !isPwdMatch ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#5aa8ad]/50'}`}
                    />
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-3.5 text-slate-400 hover:text-[#5aa8ad] transition-colors">
                      {showConfirmPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {pwdForm.confirmPassword && !isPwdMatch && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> รหัสผ่านไม่ตรงกัน</p>
                  )}
                  {pwdForm.confirmPassword && isPwdMatch && (
                    <p className="text-[#5aa8ad] text-xs mt-1.5 flex items-center gap-1"><Check size={12}/> รหัสผ่านตรงกัน</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isPwdSaving || !isNewPwdValid || !isPwdMatch}
                  className="w-full py-3.5 bg-[#5aa8ad] hover:bg-[#148F96] text-white rounded-xl font-bold transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#5aa8ad]/30"
                >
                  {isPwdSaving ? 'กำลังบันทึก...' : <>บันทึกการเปลี่ยนแปลง</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;