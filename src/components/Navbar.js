import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiFileText, FiBell, FiUser, FiMenu, FiX, FiSettings } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Dummy notifications data
  const notifications = [
    { id: 1, text: "Your ticket has been resolved.", time: "2 hours ago" },
    { id: 2, text: "New ticket assigned to you.", time: "5 hours ago" },
    { id: 3, text: "System maintenance scheduled.", time: "1 day ago" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="logo">
          <img src="/logo1.png" alt="Logo" className="logo-img" />
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

          {/* Notifications Dropdown */}
          <div className="nav-item relative">
            <button
              className="flex items-center"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false); // Close profile dropdown if open
              }}
            >
              <FiBell size={20} />
              <span>Notifications</span>
            </button>
            {notificationsOpen && (
              <div className="dropdown absolute top-10 right-0 bg-white shadow-lg rounded-lg w-64 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                      <p className="text-sm text-gray-700">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 text-center">
                  <Link
                    to="/notifications"
                    className="text-sm text-blue-500 hover:underline"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View All
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="nav-item relative">
            <button
              className="flex items-center"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false); // Close notifications dropdown if open
              }}
            >
              <FiUser size={20} />
              <span>Profile</span>
            </button>
            {profileOpen && (
              <div className="dropdown absolute top-10 right-0 bg-white shadow-lg rounded-lg w-48 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Profile</h3>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    <FiSettings className="inline-block mr-2" />
                    Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
