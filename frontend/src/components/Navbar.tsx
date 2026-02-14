import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // 1. Import Hook
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth(); // 2. ดึง user และ logout function
  const navigate = useNavigate();
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/login"); // Logout แล้วเด้งไปหน้า Login
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          HomeAlright
        </Link>

        <div className="menu-icon" onClick={handleClick}>
          <i className={click ? "fas fa-times" : "fas fa-bars"} />
        </div>

        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/home" className="nav-links" onClick={closeMobileMenu}>
              สินค้า
            </Link>
          </li>
          
          {/* ส่วนเช็คสถานะ User */}
          {user ? (
            <>
              {/* เมนูสำหรับคน Login แล้ว */}
              <li className="nav-item">
                <Link to="/cart" className="nav-links" onClick={closeMobileMenu}>
                  ตะกร้า
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/orders" className="nav-links" onClick={closeMobileMenu}>
                  ประวัติสั่งซื้อ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-links" onClick={closeMobileMenu}>
                  คุณ {user.username}
                </Link>
              </li>
              <li className="nav-item">
                <span 
                  className="nav-links cursor-pointer" 
                  onClick={handleLogout}
                  style={{ cursor: 'pointer' }}
                >
                  ออกจากระบบ
                </span>
              </li>
            </>
          ) : (
            <>
              {/* เมนูสำหรับคนยังไม่ Login */}
              <li className="nav-item">
                <Link to="/login" className="nav-links" onClick={closeMobileMenu}>
                  เข้าสู่ระบบ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-links" onClick={closeMobileMenu}>
                  สมัครสมาชิก
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;