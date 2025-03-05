import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiArrowLeft, FiMenu } from "react-icons/fi";

const Navbar = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [role, setRole] = useState("User");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const notifications = [
    { id: 1, text: "Your ticket has been resolved.", time: "2 hours ago" },
    { id: 2, text: "New ticket assigned to you.", time: "5 hours ago" },
    { id: 3, text: "System maintenance scheduled.", time: "1 day ago" },
  ];

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggle the state for mobile menu
  };

  const getPageName = (path) => {
  if (path.startsWith("/ticket/")) {
    return "Ticket Details";
  }

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
    case "/tickets/closed":
      return "Closed Tickets";
    default:
      return "Page Not Found";
  }
};

  const pageName = getPageName(location.pathname);

  return (
    <nav className="navbar flex items-center justify-between px-4 py-2 bg-gray-800">
      {/* Hamburger menu button */}
      <button onClick={handleToggleMenu} className="block lg:hidden text-white">
        <FiMenu size={24} />
      </button>

      {/* Container for back button and title centered */}
      <div className="flex items-center justify-center gap-2 w-full">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="back-btn text-white transition-all absolute left-4"
        >
          <FiArrowLeft size={24} />
        </button>

        {/* Page title */}
        <div className="page-title text-white font-semibold">{pageName}</div>
      </div>

      {/* Navbar right side */}
      <div className="navbar-right flex items-center gap-4">
        <button
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setProfileOpen(false);
          }}
          className="relative p-2"
        >
          <FiBell size={24} className="text-white" />
        </button>
        <input type="text" placeholder="Search Tickets" className="search-input" />
        <div className="relative flex items-center gap-2 profile-section">
          <div className="user-info text-white">
            <p className="username font-bold">{username}</p>
            <p className="user-role text-sm text-gray-300">{role}</p>
          </div>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="profile-placeholder"
          >
            <div className="profile-pic-placeholder"></div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "block" : "hidden"}`}>
        <ul>
          <li className="text-white">Dashboard</li>
          <li className="text-white">Tickets</li>
          <li className="text-white">Settings</li>
          <li className="text-white">Profile</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;