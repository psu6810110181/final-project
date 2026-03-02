// frontend/src/components/TabBar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const TabBar = () => {
  const location = useLocation();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // อัปเดตจำนวน bookmark เมื่อมีการเปลี่ยนแปลงใน localStorage
  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('bookmarks');
      if (saved) {
        setBookmarkCount(JSON.parse(saved).length);
      } else {
        setBookmarkCount(0);
      }
    };

    updateCount();
    // ฟังการเปลี่ยนแปลงของ localStorage เผื่อมีการกด bookmark จากหน้าอื่น
    window.addEventListener('storage', updateCount); 
    // Custom event ไว้ดักฟังเวลาแก้ไขจากหน้าเดียวกัน (เพราะ window.storage ไม่ทำงานบนแท็บเดียวกัน)
    window.addEventListener('bookmarksUpdated', updateCount); 

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('bookmarksUpdated', updateCount);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

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
          สินค้าที่สนใจ {bookmarkCount > 0 && `(${bookmarkCount})`}
        </Link>
      </div>
    </div>
  );
};

export default TabBar;