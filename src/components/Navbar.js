import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaUser } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md fixed w-full top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        {/* Left - Logo */}
        <Link to="/dashboard" className="text-xl font-bold">
          Ticket System
        </Link>

        {/* Right - Icons */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:text-gray-300">
              <FaBell className="text-lg" />
            </button>
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black shadow-md rounded-lg p-4">
                <p className="text-sm font-bold">Notifications</p>
                <ul className="mt-2">
                  <li className="border-b py-2">New ticket assigned</li>
                  <li className="border-b py-2">System update available</li>
                  <li className="py-2">New message from admin</li>
                </ul>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-2 hover:text-gray-300">
              <FaUser className="text-lg" />
            </button>
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-md rounded-lg p-2">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">Profile</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars className="text-lg" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 p-4 space-y-2">
          <Link to="/dashboard" className="block">Dashboard</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
