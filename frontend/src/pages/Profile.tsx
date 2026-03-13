// frontend/src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api'; 
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Edit3, Check, X, Star, Lock, Key, Camera } from 'lucide-react';
import heroBackground from '../assets/background.jpg';

// นำเข้า Component ย่อยที่เราเพิ่งสร้าง
import ChangeEmailModal from '../components/Profile/ChangeEmailModal';
import ChangePasswordModal from '../components/Profile/ChangePasswordModal';

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

  // State ควบคุม Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

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

  if (isLoading) return <div className="flex justify-center items-center min-h-[80vh] bg-[#F8FAFA]"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#148F96]"></div></div>;
  if (!profile) return <div className="flex justify-center items-center min-h-[80vh] text-slate-500 text-lg bg-[#F8FAFA]">ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง</div>;

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative overflow-hidden font-sans pt-10">
      
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a4d52]/60 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFA] via-[#F8FAFA]/90 to-transparent z-10" />
        <img src={heroBackground} alt="Background" className="absolute inset-0 w-full h-full object-cover scale-105" />
      </div>

      <div className="absolute top-[-20%] left-1/4 w-[600px] h-[600px] bg-[#5aa8ad]/30 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#148F96]/20 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Main Container */}
      <div className={`relative z-10 container mx-auto px-4 max-w-4xl transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-[#5aa8ad]/20 border border-white/80 overflow-hidden relative">
          
          <div className="h-48 bg-gradient-to-r from-[#5aa8ad] via-[#148F96] to-[#0a4d52] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          </div>
          
          <div className="px-8 md:px-12 pb-12">
            
            {/* Header / Avatar */}
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
                      <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={handleImageChange} />
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
              
              {/* Action Buttons */}
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
                      onClick={handleCancel} disabled={isSaving}
                      className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <X size={18} /> ยกเลิก
                    </button>
                    <button 
                      onClick={handleSave} disabled={isSaving}
                      className="px-8 py-3 bg-[#148F96] hover:bg-[#0f6f75] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#148F96]/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? 'กำลังบันทึก...' : <><Check size={18} /> บันทึก</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-100 to-transparent mb-10"></div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <User size={16} /> <span className="text-sm font-bold uppercase tracking-wider text-[#5aa8ad]">ชื่อผู้ใช้</span>
                </div>
                <div className="text-slate-800 font-medium text-lg px-2">{profile.username}</div>
              </div>

              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Mail size={16} /> <span className="text-sm font-bold uppercase tracking-wider text-[#5aa8ad]">อีเมล</span>
                  </div>
                  <div className="text-slate-800 font-medium text-lg px-2">{profile.email || '-'}</div>
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
                    type="tel" name="phone" value={editData.phone} onChange={handleInputChange} placeholder="08X-XXX-XXXX"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5aa8ad]/50 focus:bg-white transition-all"
                  />
                )}
              </div>

              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Star size={16} /> <span className="text-sm font-bold uppercase tracking-wider text-[#5aa8ad]">สถานะบัญชี</span>
                </div>
                <div className="text-slate-800 font-black text-lg px-2 uppercase">{profile.role}</div>
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
                    name="address" value={editData.address} onChange={handleInputChange} rows={4}
                    placeholder="บ้านเลขที่, ถนน, ซอย, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5aa8ad]/50 focus:bg-white transition-all resize-none"
                  />
                )}
              </div>
            </div>

            {/* Security Section */}
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

      {/* Render Modals */}
      {showEmailModal && <ChangeEmailModal onClose={() => setShowEmailModal(false)} />}
      {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}

    </div>
  );
};

export default Profile;