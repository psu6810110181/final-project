import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import toast from 'react-hot-toast';
// ✅ เพิ่ม Star เข้ามาในบรรทัดนี้แล้วครับ
import { User, Mail, Phone, MapPin, Edit3, Check, X, Star } from 'lucide-react';

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

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchProfileData = async () => {
    try {
      const data = await getProfile(); 
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

  const handleEditClick = () => {
    setEditData({
      phone: profile?.phone || '',
      address: profile?.address || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('phone', editData.phone);
      formData.append('address', editData.address);

      await updateProfile(formData);
      await fetchProfileData();
      setIsEditing(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-[#F8FAFA]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#148F96]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] text-slate-500 text-lg bg-[#F8FAFA]">
        ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative overflow-hidden font-sans pt-10">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-1/4 w-[600px] h-[600px] bg-[#148F96]/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-slate-400/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className={`relative z-10 container mx-auto px-4 max-w-4xl transition-all duration-1000 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden relative">
          
          {/* Header Gradient Cover */}
          <div className="h-48 bg-gradient-to-r from-slate-900 via-[#0a4d52] to-[#148F96] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          
          <div className="px-8 md:px-12 pb-12">
            {/* Profile Avatar & Actions */}
            <div className="relative flex flex-col md:flex-row md:justify-between items-center md:items-end -mt-20 mb-10 gap-6">
              <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
                <div className="w-40 h-40 bg-white rounded-[2rem] p-2 shadow-2xl border border-white/50 overflow-hidden mb-4 md:mb-0 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  {profile.userImage ? (
                    <img 
                      src={profile.userImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-[1.5rem]" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 text-[#148F96] rounded-[1.5rem] flex items-center justify-center text-6xl font-black uppercase shadow-inner">
                      {profile.username.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="md:ml-44 md:-mt-16">
                  <h1 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">{profile.username}</h1>
                  <p className="text-[#148F96] font-bold mt-1 uppercase tracking-widest text-sm bg-teal-50 px-3 py-1 rounded-full inline-block">
                    {profile.role} ACCOUNT
                  </p>
                </div>
              </div>
              
              <div className="z-10">
                {!isEditing ? (
                  <button 
                    onClick={handleEditClick}
                    className="px-8 py-3 bg-slate-900 hover:bg-[#148F96] text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-[#148F96]/30 flex items-center gap-2 active:scale-95"
                  >
                    <Edit3 size={18} /> แก้ไขข้อมูล
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

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-10"></div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Username (Readonly) */}
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <User size={16} /> <span className="text-sm font-bold uppercase tracking-wider">ชื่อผู้ใช้</span>
                </div>
                <div className="text-slate-800 font-medium text-lg px-2">
                  {profile.username}
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Mail size={16} /> <span className="text-sm font-bold uppercase tracking-wider">อีเมล</span>
                </div>
                <div className="text-slate-800 font-medium text-lg px-2">
                  {profile.email || '-'}
                </div>
              </div>

              {/* Phone */}
              <div className={`p-5 rounded-3xl border transition-colors ${isEditing ? 'bg-white border-[#148F96]/30 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Phone size={16} className={isEditing ? "text-[#148F96]" : ""} /> 
                  <span className={`text-sm font-bold uppercase tracking-wider ${isEditing ? "text-[#148F96]" : ""}`}>เบอร์โทรศัพท์</span>
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
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#148F96]/50 focus:bg-white transition-all"
                  />
                )}
              </div>

              {/* Role */}
              <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Star size={16} /> <span className="text-sm font-bold uppercase tracking-wider">สถานะบัญชี</span>
                </div>
                <div className="text-slate-800 font-black text-lg px-2 uppercase">
                  {profile.role}
                </div>
              </div>

              {/* Address */}
              <div className={`md:col-span-2 p-5 rounded-3xl border transition-colors ${isEditing ? 'bg-white border-[#148F96]/30 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <MapPin size={16} className={isEditing ? "text-[#148F96]" : ""} /> 
                  <span className={`text-sm font-bold uppercase tracking-wider ${isEditing ? "text-[#148F96]" : ""}`}>ที่อยู่สำหรับจัดส่ง</span>
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
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#148F96]/50 focus:bg-white transition-all resize-none"
                  />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;