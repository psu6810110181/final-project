import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css"; // อย่าลืมบรรทัดนี้

const Navbar = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          HomeAlright
        </Link>

        {/* Hamburger Icon */}
        <div className="menu-icon" onClick={handleClick}>
           <i className={click ? "fas fa-times" : "fas fa-bars"} />
        </div>

        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className="nav-links" onClick={closeMobileMenu}>Products</Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-links" onClick={closeMobileMenu}>Cart</Link>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-links" onClick={closeMobileMenu}>Login</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;