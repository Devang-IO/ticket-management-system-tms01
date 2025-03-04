import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiArrowLeft, FiMenu } from "react-icons/fi";

const Navbar = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current path
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Your ticket has been resolved.", time: "2 hours ago" },
    { id: 2, text: "New ticket assigned to you.", time: "5 hours ago" },
    { id: 3, text: "System maintenance scheduled.", time: "1 day ago" },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to map the pathname to the page name
  const getPageName = (path) => {
    switch (path) {
      case "/dashboard":
        return "User Dashboard";
      case "/tickets":
        return "My Tickets";
      case "/settings":
        return "Settings";
      case "/profile":
        return "Profile";
      case "/home":
        return "Home";
      default:
        return "Page Not Found";
    }
  };

  const pageName = getPageName(location.pathname); // Get the page name based on the current path

  return (
    <nav className="navbar flex items-center justify-between px-4 py-2 bg-gray-800">
      {/* Hamburger Menu for Mobile */}
      <button onClick={handleToggleMenu} className="block lg:hidden text-white">
        <FiMenu size={24} />
      </button>

      {/* Back Button (Icon Only) */}
      <button
        onClick={handleBack}
        className={`back-btn text-white ${sidebarOpen ? "-[370px]" : "mr-0"} lg:ml-0 transition-all`}
      >
        <FiArrowLeft size={24} />
      </button>

      {/* Page Title (Centered) */}
      <div className="page-title">{pageName}</div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2"
          >
            <FiBell size={24} className="text-white" />
          </button>
          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
              </div>
              <div className="dropdown-content">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="dropdown-item">
                    <p>{notification.text}</p>
                    <p className="time-text">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <a
                  href="/notifications"
                  className="view-all-link"
                  onClick={() => setNotificationsOpen(false)}
                >
                  View All
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <input type="text" placeholder="Search Tickets" className="search-input" />

        {/* Profile Placeholder */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="profile-placeholder"
          >
            <div className="profile-pic-placeholder"></div>
          </button>
          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <h3>Profile</h3>
              </div>
              <div className="dropdown-content">
                <a href="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  View Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu lg:hidden ${menuOpen ? "block" : "hidden"} absolute top-0 right-0 bg-gray-800 p-4 w-48`}
      >
        <ul>
          <li>
            <a href="/dashboard" className="text-white">Dashboard</a>
          </li>
          <li>
            <a href="/tickets" className="text-white">My Tickets</a>
          </li>
          <li>
            <a href="/settings" className="text-white">Settings</a>
          </li>
          <li>
            <button onClick={() => navigate("/login")} className="text-white">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
