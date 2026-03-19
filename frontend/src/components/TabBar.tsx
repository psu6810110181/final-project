import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as api from '../services/api';

const TabBar = () => {
  const location = useLocation();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // อัปเดตจำนวน bookmark โดยดึงจาก API แทน localStorage
  useEffect(() => {
    const updateCount = async () => {
      // ✅ แก้ไข: เช็คโทเคนทั้งจาก localStorage และ sessionStorage (แก้บัคล็อกอินแบบไม่จดจำฉัน)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setBookmarkCount(0); // ถ้าไม่ได้ล็อกอิน ไม่ต้องแสดงจำนวน
        return;
      }

      try {
        const data = await api.getBookmarks().catch(() => []); // ดึงจาก API
        if (Array.isArray(data)) {
          setBookmarkCount(data.length);
        } else if (data && Array.isArray(data.data)) {
          setBookmarkCount(data.data.length);
        } else {
          setBookmarkCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch bookmarks count', error);
        setBookmarkCount(0);
      }
    };

    updateCount();
    
    // ฟังการเปลี่ยนแปลงเผื่อมีการกดเข้า-ออกระบบ
    window.addEventListener('storage', updateCount); 
    // ฟัง Event เมื่อมีการกดเพิ่ม/ลบ Bookmark จากหน้าอื่นๆ
    window.addEventListener('bookmarksUpdated', updateCount); 

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('bookmarksUpdated', updateCount);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // ✅ กำหนดเงื่อนไขแสดง 99+ เมื่อเกิน 99
  const displayCount = bookmarkCount > 99 ? '99+' : bookmarkCount;

  return (
    <div className="bg-white pt-4 px-4 border-b">
      <div className="container mx-auto flex gap-6">
        <Link 
            to="/" 
            className={`font-medium pb-2 transition-colors ${isActive('/') || isActive('/home') ? 'text-[#148F96] font-bold border-b-2 border-[#148F96]' : 'text-gray-500 hover:text-[#148F96]'}`}
        >
          สินค้าทั้งหมด
        </Link>
        <Link 
            to="/promotions" 
            className={`font-medium pb-2 transition-colors ${isActive('/promotions') ? 'text-[#148F96] font-bold border-b-2 border-[#148F96]' : 'text-gray-500 hover:text-[#148F96]'}`}
        >
          สินค้าโปรโมชัน
        </Link>
        <Link 
            to="/bookmarks" 
            className={`font-medium pb-2 transition-colors ${isActive('/bookmarks') ? 'text-[#148F96] font-bold border-b-2 border-[#148F96]' : 'text-gray-500 hover:text-[#148F96]'}`}
        >
          {/* ✅ เรียกใช้ตัวแปร displayCount ตรงนี้ */}
          สินค้าที่สนใจ {bookmarkCount > 0 && `(${displayCount})`}
        </Link>
      </div>
    </div>
  );
};

export default TabBar;