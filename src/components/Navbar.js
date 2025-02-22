import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiFileText, FiBell, FiUser } from "react-icons/fi"; // Importing icons for Navbar

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md fixed w-full top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img src="/logo2.png" alt="Logo" className="h-10" /> {/* Adjust the height as needed */}
          <span className="text-xl font-bold">QuickAssist</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-2 hover:underline">
            <FiHome size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/tickets" className="flex items-center space-x-2 hover:underline">
            <FiFileText size={20} />
            <span>Tickets</span>
          </Link>
          <Link to="/notifications" className="flex items-center space-x-2 hover:underline">
            <FiBell size={20} />
            <span>Notifications</span>
          </Link>
          <Link to="/profile" className="flex items-center space-x-2 hover:underline">
            <FiUser size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
