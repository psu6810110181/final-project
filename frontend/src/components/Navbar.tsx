// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    // Fixed Navbar top
    <nav className="w-full h-16 bg-[#007c8a] flex items-center justify-between px-4 md:px-6 shadow-md fixed top-0 z-50">
      
      {/* 1. Logo Section -> Link to Home */}
      <div className="flex items-center gap-2">
        <Link to="/home" className="text-white font-bold text-xl flex items-center gap-2 hover:opacity-90 transition-opacity">
           <div className="border-2 border-white p-1 rounded-lg">
             <Home size={20} />
           </div>
           <span>HomeAlright</span>
        </Link>
      </div>

      {/* 2. Search Bar Section */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <input 
            type="text" 
            placeholder="ค้นหาสินค้า..." 
            className="w-full py-2 pl-4 pr-10 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5e9da3]"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#007c8a]">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* 3. Icons Section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Icon for Mobile */}
        <button className="text-white md:hidden hover:text-gray-200">
            <Search size={24} />
        </button>

        {/* Cart Icon -> Link to /cart */}
        <Link to="/cart" className="relative text-white hover:text-gray-200 transition-colors">
          <ShoppingCart size={28} />
          {/* Badge ตัวอย่างจำนวนสินค้า (ถ้ามี) */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            0
          </span>
        </Link>

        {/* Profile Icon -> Link to /profile */}
        <Link to="/profile" className="text-white hover:text-gray-200 transition-colors">
          <User size={28} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;