import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiFileText, FiBell, FiUser } from "react-icons/fi"; // Importing icons for Navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="logo">
          <img src="/logo2.png" alt="Logo" className="logo-img" />
          <span className="logo-text">QuickAssist</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/dashboard" className="nav-item">
            <FiHome size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tickets" className="nav-item">
            <FiFileText size={20} />
            <span>Tickets</span>
          </Link>
          <Link to="/notifications" className="nav-item">
            <FiBell size={20} />
            <span>Notifications</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <FiUser size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
