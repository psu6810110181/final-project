import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// เพิ่มการนำเข้า updateProfile
import { getProfile, updateProfile } from '../services/api';

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

  // --- State สำหรับการแก้ไขข้อมูล ---
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
      console.error('Failed to fetch profile:', error);
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
    }
  };

  // --- Handlers สำหรับฟอร์มแก้ไข ---
  const handleEditClick = () => {
    // นำข้อมูลปัจจุบันมาใส่ในฟอร์มเตรียมแก้ไข
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
      // สร้าง FormData ตามที่ api.ts ต้องการ
      const formData = new FormData();
      formData.append('phone', editData.phone);
      formData.append('address', editData.address);

      await updateProfile(formData);
      
      // อัปเดตข้อมูลในหน้าจอใหม่หลังบันทึกเสร็จ
      await fetchProfileData();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#148F96]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500 text-lg">
        ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">บัญชีของฉัน</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#148F96] to-[#107378]"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="flex items-end space-x-6">
              <div className="w-32 h-32 bg-white rounded-full p-1 shadow-md overflow-hidden">
                {profile.userImage ? (
                  <img 
                    src={profile.userImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#148F96]/10 text-[#148F96] rounded-full flex items-center justify-center text-5xl font-bold uppercase">
                    {profile.username.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
                <p className="text-gray-500 mt-1 uppercase text-sm font-semibold tracking-wider">
                  Status: {profile.role}
                </p>
              </div>
            </div>
            
            {/* สลับปุ่มตามโหมด Edit / View */}
            {!isEditing ? (
              <button 
                onClick={handleEditClick}
                className="px-6 py-2 bg-[#148F96] hover:bg-[#107378] text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                แก้ไขโปรไฟล์
              </button>
            ) : (
              <div className="flex space-x-3">
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            )}
          </div>

          <hr className="mb-8 border-gray-100" />

          {/* ฟอร์มข้อมูล */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">ชื่อผู้ใช้<span className="text-xs text-gray-400">- ไม่อนุญาตให้แก้ไข</span></label>
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed">
                {profile.username}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">อีเมล<span className="text-xs text-gray-400">- ไม่อนุญาตให้แก้ไข</span></label>
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed">
                {profile.email || 'ไม่ได้ระบุ'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                  {profile.phone || 'ยังไม่ได้ระบุข้อมูล'}
                </div>
              ) : (
                <input 
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  className="w-full p-3 bg-white border border-[#148F96] rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148F96]/50"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500">ตำแหน่ง</label>
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 uppercase cursor-not-allowed">
                {profile.role}
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-500">ที่อยู่ปัจจุบัน</label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[80px] whitespace-pre-wrap">
                  {profile.address || 'ยังไม่ได้ระบุที่อยู่สำหรับจัดส่ง'}
                </div>
              ) : (
                <textarea 
                  name="address"
                  value={editData.address}
                  onChange={handleInputChange}
                  placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า"
                  rows={3}
                  className="w-full p-3 bg-white border border-[#148F96] rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#148F96]/50 resize-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;