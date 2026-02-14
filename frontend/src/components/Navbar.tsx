import React from 'react';
import { Search, ShoppingCart, User } from 'lucide-react'; // ตรวจสอบว่ามี lucide-react หรือใช้ icon library อื่น ถ้าไม่มีอาจต้องลงเพิ่ม หรือใช้ text แทนก่อน

const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-16 bg-[#007c8a] flex items-center justify-between px-6 shadow-md fixed top-0 z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <div className="text-white font-bold text-xl flex items-center gap-2">
           {/* ใช้ icon บ้านหรือ Logo ตาม Figma */}
           <span className="border-2 border-white p-1 rounded-lg">🏠</span> 
           HomeAlright
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full py-2 px-4 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5e9da3]"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Icons Section */}
      <div className="flex items-center gap-6">
        <button className="text-white hover:text-gray-200 transition-colors">
          <ShoppingCart size={28} />
        </button>
        <button className="text-white hover:text-gray-200 transition-colors">
          <User size={28} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;