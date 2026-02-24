// frontend/src/components/Navbar.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, User, LogOut, ClipboardList, Star, 
  UserCircle, Armchair, LayoutDashboard, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext'; // เพิ่มการนำเข้า useCart

// นำเข้าไฟล์โลโก้จากโฟลเดอร์ assets
import logoImg from '../assets/HomeAlright_logo.webp';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart(); // เรียกใช้ข้อมูลตะกร้าสินค้าจาก Context
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- STATE สำหรับ Dropdown โปรไฟล์ ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // คำนวณจำนวนสินค้าทั้งหมดในตะกร้า (สมมติว่า cartItems มี property quantity)
  // หากโครงสร้างของคุณเป็น array ธรรมดา สามารถใช้ cartItems?.length || 0 ได้
  const cartItemCount = cartItems?.reduce((total: number, item: any) => total + (item.quantity || 1), 0) || 0;

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

  // --- Function เช็คสถานะ Active สำหรับไอคอน Navbar ---
  const getNavStyle = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-white border-2 border-white rounded-lg p-1.5 transition-all duration-300 relative" 
      : "text-white hover:text-gray-200 border-2 border-transparent hover:border-white/50 rounded-lg p-1.5 transition-all duration-300 relative"; 
  };

  // ตรวจสอบว่าอยู่หน้าหมวดหมู่ที่เกี่ยวข้องกับโปรไฟล์หรือไม่
  const isProfileActive = ['/profile', '/orders', '/review', '/policy', '/admin'].includes(location.pathname);

  return (
    <nav className="bg-[#148F96] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* โลโก้แบบใหม่ */}
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
              {/* 1. ไอคอนเฟอร์นิเจอร์ (ไปหน้า Home) + เพิ่มข้อความ */}
              <Link 
                to="/" 
                className={`${getNavStyle('/')} flex items-center gap-2 sm:px-3`} 
                title="หน้าแรก"
              >
                <Armchair size={24} />
                <span className="font-medium text-sm hidden sm:block">เฟอร์นิเจอร์</span>
              </Link>

              {/* 2. ไอคอนตะกร้า + Badge แสดงจำนวนสินค้า */}
              <Link to="/cart" className={getNavStyle('/cart')} title="ตะกร้าสินค้า">
                <ShoppingCart size={24} />
                {/* แสดง Badge สีแดงเมื่อมีสินค้าในตะกร้า */}
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1 border-2 border-[#148F96] shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* 3. ไอคอนโปรไฟล์ & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 text-white hover:text-gray-200 transition-colors focus:outline-none p-1.5 rounded-lg border-2 ${
                    isProfileActive || isDropdownOpen 
                      ? 'border-white' 
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="font-medium hidden sm:block">{user.username}</span>
                </button>

                {/* รายการเมนูใน Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2 border border-gray-100 transform origin-top-right transition-all">
                    
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
              <Link 
                to="/login" 
                className={`font-medium text-sm transition-all duration-300 px-4 py-2 rounded-lg border-2 ${
                  location.pathname === '/login' 
                    ? 'text-white border-white' 
                    : 'text-white border-transparent hover:border-white/50'
                }`}
              >
                เข้าสู่ระบบ
              </Link>
              <Link 
                to="/register" 
                className={`font-bold text-sm transition-all duration-300 px-4 py-2 rounded-lg shadow-sm border-2 ${
                  location.pathname === '/register'
                    ? 'bg-gray-100 text-[#148F96] border-white' 
                    : 'bg-white text-[#148F96] border-transparent hover:bg-gray-100'
                }`}
              >
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