import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiMenu, FiUser, FiLogOut } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify"; // ✅ Ensure toast imports
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles

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
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
  }, []);

  const notifications = [
    { id: 1, text: "Your ticket has been resolved.", time: "2 hours ago" },
    { id: 2, text: "New ticket assigned to you.", time: "5 hours ago" },
    { id: 3, text: "System maintenance scheduled.", time: "1 day ago" },
    { id: 4, text: "Your account has been updated.", time: "2 days ago" },
    { id: 5, text: "New feature released: Dark Mode.", time: "3 days ago" },
    { id: 6, text: "Reminder: Submit your weekly report.", time: "4 days ago" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.setItem("isAuthenticated", "false");

    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 1000, // ✅ Allow time for notification to appear
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    setTimeout(() => {
      navigate("/login");
    }, 1000); // ✅ Ensures redirection AFTER notification appears
  };

  const getPageName = (path) => {
    if (path.startsWith("/ticket/")) return "Ticket Details";

    switch (path) {
      case "/dashboard": return "User Dashboard";
      case "/tickets": return "My Tickets";
      case "/settings": return "Settings";
      case "/profile": return "Profile";
      case "/home": return "Home";
      case "/tickets/closed": return "Closed Tickets";
      default: return "Page Not Found";
    }
  };

  const pageName = getPageName(location.pathname);

  return (
    <>
      <nav className="navbar flex items-center justify-between px-4 py-2 bg-gray-800">
        {/* Hamburger menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="block lg:hidden text-white">
          <FiMenu size={24} />
        </button>

        {/* Page title centered */}
        <div className="flex items-center justify-center gap-2 w-full">
          <div className="page-title text-white font-semibold">{pageName}</div>
        </div>

        {/* Navbar right side */}
        <div className="navbar-right flex items-center gap-4">
          {/* Notifications dropdown */}
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Notifications</h3>
                  <ul className="max-h-48 overflow-y-auto">
                    {notifications.map((notification) => (
                      <li key={notification.id} className="py-2 border-b border-gray-200 last:border-b-0">
                        <p className="text-sm text-gray-700">{notification.text}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search Tickets"
            className="search-input bg-gray-700 text-white px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Profile dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 profile-section">
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
              />
            </div>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out">
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                    <FiUser className="text-gray-700" />
                    <span className="text-sm text-gray-700">View Profile</span>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={handleLogout} // ✅ Logout function fixed
                  >
                    <FiLogOut className="text-red-500" />
                    <span className="text-sm text-red-500">Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ Toast Container - REQUIRED for notifications to work */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default Navbar;
