// frontend/src/components/Navbar.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, User, LogOut, ClipboardList, Star, 
  UserCircle, Armchair, LayoutDashboard, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext'; 

// นำเข้าไฟล์โลโก้จากโฟลเดอร์ assets
import logoImg from '../assets/HomeAlright_logo.webp';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- STATE สำหรับ Dropdown โปรไฟล์ ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // คำนวณจำนวนสินค้าทั้งหมดในตะกร้า
  const cartItemCount = cartItems?.reduce((total: number, item: any) => total + (item.quantity || 1), 0) || 0;

  // --- กำหนด URL สำหรับดึงรูปภาพโปรไฟล์ ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getAvatarUrl = (img?: string) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${API_BASE_URL}/uploads/profiles/${img}`; 
  };

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
  // ✅ ปรับ p-1.5 เป็น p-1 ในจอมือถือเพื่อประหยัดพื้นที่
  const getNavStyle = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-white border-2 border-white rounded-lg p-1 sm:p-1.5 transition-all duration-300 relative flex items-center justify-center" 
      : "text-white hover:text-gray-200 border-2 border-transparent hover:border-white/50 rounded-lg p-1 sm:p-1.5 transition-all duration-300 relative flex items-center justify-center"; 
  };

  // ตรวจสอบว่าอยู่หน้าหมวดหมู่ที่เกี่ยวข้องกับโปรไฟล์หรือไม่
  const isProfileActive = ['/profile', '/orders', '/review', '/policy', '/admin'].includes(location.pathname);

  return (
    <nav className="bg-[#148F96] shadow-md sticky top-0 z-50">
      {/* ✅ ลด padding ด้านข้างในจอมือถือ (px-2 sm:px-4) */}
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        
        {/* โลโก้แบบใหม่ */}
        {/* ✅ ปรับขนาดโลโก้และฟอนต์ให้เล็กลงนิดนึงในจอมือถือ */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-white hover:text-gray-200 transition-colors flex-shrink-0">
          <img 
            src={logoImg} 
            alt="HomeAlright Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#04A5E3] bg-white object-contain p-0.5 sm:p-1"
          />
          <span className="truncate max-w-[140px] sm:max-w-none">HomeAlright</span>
        </Link>

        {/* เมนูฝั่งขวา */}
        {/* ✅ ปรับระยะห่างระหว่างไอคอน gap-6 -> gap-1.5 บนมือถือ และกว้างขึ้นในจอใหญ่ */}
        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
          {user ? (
            <>
              {/* 1. ไอคอนเฟอร์นิเจอร์ (ไปหน้า Home) + เพิ่มข้อความ */}
              <Link 
                to="/" 
                className={`${getNavStyle('/')} gap-1.5 sm:gap-2 sm:px-3`} 
                title="หน้าแรก"
              >
                <Armchair size={22} className="sm:w-6 sm:h-6" />
                <span className="font-medium text-sm hidden sm:block">เฟอร์นิเจอร์</span>
              </Link>

              {/* 2. ไอคอนตะกร้า + Badge แสดงจำนวนสินค้า */}
              <Link to="/cart" className={getNavStyle('/cart')} title="ตะกร้าสินค้า">
                <ShoppingCart size={22} className="sm:w-6 sm:h-6" />
                {/* แสดง Badge สีแดงเมื่อมีสินค้าในตะกร้า */}
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] flex items-center justify-center rounded-full px-1 border border-[#148F96] sm:border-2 shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* 3. ไอคอนรูปโปรไฟล์ & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 text-white hover:text-gray-200 transition-colors focus:outline-none p-1 sm:p-1.5 rounded-lg border-2 ${
                    isProfileActive || isDropdownOpen 
                      ? 'border-white bg-white/10' 
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  {/* ✅ ปรับขนาดรูปโปรไฟล์ในจอมือถือให้พอดี */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30">
                    {user.userImage || (user as any).image ? (
                      <img 
                        src={getAvatarUrl(user.userImage || (user as any).image) as string} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} className="text-white sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <span className="font-medium hidden sm:block max-w-[100px] truncate">{user.username}</span>
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
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/login" 
                className={`font-medium text-xs sm:text-sm transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 whitespace-nowrap ${
                  location.pathname === '/login' 
                    ? 'text-white border-white' 
                    : 'text-white border-transparent hover:border-white/50'
                }`}
              >
                เข้าสู่ระบบ
              </Link>
              <Link 
                to="/register" 
                className={`font-medium text-xs sm:text-sm transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 whitespace-nowrap ${
                  location.pathname === '/register'
                    ? 'text-white border-white' 
                    : 'text-white border-transparent hover:border-white/50'
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