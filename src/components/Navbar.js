import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiUser, FiSettings, FiLogOut, FiEdit } from "react-icons/fi";

const Navbar = () => {
  const user = {
    name: "Rohit Mehra",
    role: "User",
  };

  // State for dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const notifications = [
    { id: 1, message: "Your tikcet has been closed", time: "2m ago" },
    { id: 2, message: "System maintenance notice", time: "1h ago" },
    { id: 3, message: "Your ticket has been updated", time: "3h ago" },
  ];

  // Ref to close dropdown when clicking outside
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="logo">
          <img src="/logo2.png" alt="Logo" className="logo-img" />
          <span className="logo-text">QuickAssist</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative hover:text-gray-300">
              <FiBell size={22} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg p-2">
                <h3 className="text-sm font-semibold px-2 py-1 border-b">Notifications</h3>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-2 border-b hover:bg-gray-100">
                      <p className="text-sm">{notification.message}</p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-2">No new notifications</p>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <FiUser size={22} />
            <span className="hidden md:block">{user.name} ({user.role})</span>
          </div>

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setShowSettings(!showSettings)} className="hover:text-gray-300">
              <FiSettings size={22} />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg p-2">
                <Link to="/profile" className="flex items-center p-2 hover:bg-gray-100">
                  <FiEdit size={18} className="mr-2" /> Edit Profile
                </Link>
                
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;