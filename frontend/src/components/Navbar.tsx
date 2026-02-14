import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';

// TODO: Uncomment these when AuthContext and CartContext are implemented
// import { useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { CartContext } from '../context/CartContext';

const Navbar = () => {
  // TODO: Get user and cartItems from context
  // const { user } = useContext(AuthContext);
  // const { cartItems } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock data for now
  const user = null; 
  const cartItems: any[] = []; 

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-[#FDF8F5] py-4 px-6 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <Link to="/">HomeAlright</Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-gray-900 transition-colors">หน้าแรก</Link>
          <Link to="/home" className="hover:text-gray-900 transition-colors">สินค้าทั้งหมด</Link>
          {/* Note: You'll need to create 'About' and 'Contact' pages if they don't exist */}
          <Link to="/about" className="hover:text-gray-900 transition-colors">เกี่ยวกับเรา</Link>
          <Link to="/contact" className="hover:text-gray-900 transition-colors">ติดต่อเรา</Link>
        </div>

        {/* Icons (Desktop & Mobile) */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-gray-600">
          {/* Search Icon */}
          <button className="hover:text-gray-900 transition-colors hidden sm:block">
            <FiSearch size={24} />
          </button>

          {/* Cart Icon */}
          <Link to="/cart" className="hover:text-gray-900 transition-colors relative">
            <FiShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* User Icon / Login */}
          <div className="relative hidden sm:block">
            {user ? (
              <Link to="/profile" className="hover:text-gray-900 transition-colors">
                <FiUser size={24} />
              </Link>
            ) : (
              <Link to="/login" className="hover:text-gray-900 transition-colors">
                <FiUser size={24} />
              </Link>
            )}
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button onClick={toggleMobileMenu} className="md:hidden hover:text-gray-900 focus:outline-none transition-colors">
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-4 text-gray-600 font-medium flex flex-col items-center bg-[#FDF8F5]">
          <Link to="/" className="hover:text-gray-900 transition-colors" onClick={toggleMobileMenu}>หน้าแรก</Link>
          <Link to="/home" className="hover:text-gray-900 transition-colors" onClick={toggleMobileMenu}>สินค้าทั้งหมด</Link>
          <Link to="/about" className="hover:text-gray-900 transition-colors" onClick={toggleMobileMenu}>เกี่ยวกับเรา</Link>
          <Link to="/contact" className="hover:text-gray-900 transition-colors" onClick={toggleMobileMenu}>ติดต่อเรา</Link>
          
          {/* Mobile Icons (Search & User) */}
          <div className="flex space-x-6 mt-4">
            <button className="hover:text-gray-900 transition-colors">
              <FiSearch size={24} />
            </button>
            {user ? (
              <Link to="/profile" className="hover:text-gray-900 transition-colors" onClick={toggleMobileMenu}>
                <FiUser size={24} />
              </Link>
            ) : (
              <Link to="/login" className="hover:text-gray-900 transition-colors" onClick={toggleMobileMenu}>
                <FiUser size={24} />
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;