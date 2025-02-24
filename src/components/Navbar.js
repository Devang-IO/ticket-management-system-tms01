import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiFileText, FiBell, FiUser, FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="logo">
          <img src="/logo2.png" alt="Logo" className="logo-img" />
          <span className="logo-text">QuickAssist</span>
        </Link>

        {/* Hamburger Menu (Mobile) */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? "mobile" : ""}`}>
          <Link to="/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>
            <FiHome size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tickets" className="nav-item" onClick={() => setMenuOpen(false)}>
            <FiFileText size={20} />
            <span>Tickets</span>
          </Link>
          <Link to="/notifications" className="nav-item" onClick={() => setMenuOpen(false)}>
            <FiBell size={20} />
            <span>Notifications</span>
          </Link>
          <Link to="/profile" className="nav-item" onClick={() => setMenuOpen(false)}>
            <FiUser size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
