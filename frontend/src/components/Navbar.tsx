// frontend/src/components/Navbar.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, LogOut, ClipboardList, Star, 
  UserCircle, Armchair, LayoutDashboard, Shield // เพิ่มไอคอน Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// นำเข้าไฟล์โลโก้จากโฟลเดอร์ assets
import logoImg from '../assets/HomeAlright_logo.webp';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // --- STATE สำหรับ Dropdown โปรไฟล์ ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด Dropdown เมื่อคลิกที่อื่นบนหน้าจอ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-[#148F96] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* โลโก้แบบใหม่: มีรูปวงกลม ขอบสี #04A5E3 และข้อความ */}
        <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white hover:text-gray-200 transition-colors">
          <img 
            src={logoImg} 
            alt="HomeAlright Logo" 
            className="w-10 h-10 rounded-full border-2 border-[#04A5E3] bg-white object-contain p-1"
          />
          HomeAlright
        </Link>

        {/* เมนูฝั่งขวา */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* 1. ไอคอนเฟอร์นิเจอร์ (ไปหน้า Home) วางไว้หน้าตะกร้า */}
              <Link to="/" className="text-white hover:text-gray-200 transition-colors" title="หน้าแรก">
                <Armchair size={24} />
              </Link>

              {/* 2. ไอคอนตะกร้า */}
              <Link to="/cart" className="text-white hover:text-gray-200 transition-colors relative" title="ตะกร้าสินค้า">
                <ShoppingCart size={24} />
              </Link>

              {/* 3. ไอคอนโปรไฟล์ & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="font-medium hidden sm:block">{user.username}</span>
                </button>

                {/* รายการเมนูใน Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2 border border-gray-100 transform origin-top-right transition-all">
                    
                    {/* --- เช็คสิทธิ์ Admin เพื่อแสดง Admin Dashboard --- */}
                    {user.role === 'admin' && (
                      <>
                        <Link 
                          to="/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#148F96] hover:bg-gray-50"
                        >
                          <LayoutDashboard size={18} />
                          Admin Dashboard
                        </Link>
                        <hr className="my-1 border-gray-100" />
                      </>
                    )}

                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#148F96]"
                    >
                      <UserCircle size={18} />
                      จัดการโปรไฟล์
                    </Link>
                    
                    <Link 
                      to="/orders" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#148F96]"
                    >
                      <ClipboardList size={18} />
                      ประวัติการสั่งซื้อ
                    </Link>
                    
                    <Link 
                      to="/review" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#148F96]"
                    >
                      <Star size={18} />
                      รีวิวของฉัน
                    </Link>

                    {/* เพิ่มเมนูนโยบายความเป็นส่วนตัวตรงนี้ */}
                    <Link 
                      to="/policy" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#148F96]"
                    >
                      <Shield size={18} />
                      นโยบายความเป็นส่วนตัว
                    </Link>
                    
                    <hr className="my-1 border-gray-100" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut size={18} />
                      ออกจากระบบ
                    </button>

                  </div>
                )}
              </div>
            </>
          ) : (
            /* กรณีที่ยังไม่ได้ Login */
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-white hover:text-gray-200 font-medium text-sm">เข้าสู่ระบบ</Link>
              <Link to="/register" className="bg-white text-[#148F96] px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;