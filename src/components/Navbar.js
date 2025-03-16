import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiMenu, FiUser, FiLogOut } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import ProfileModal from "./ProfileModal";

const Navbar = ({ sidebarOpen }) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [role, setRole] = useState("User");
  const [profilePicture, setProfilePicture] = useState(null); // State for profile picture

  // Fetch profile data from localStorage on component mount
  const fetchProfileData = () => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedProfilePicture = localStorage.getItem("profilePicture");
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);
  };

  useEffect(() => {
    fetchProfileData(); // Fetch profile data on mount
  }, []);

  // Callback function to update Navbar after profile edit
  const handleProfileUpdate = () => {
    fetchProfileData(); // Re-fetch profile data
  };

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
    localStorage.removeItem("profilePicture");
    localStorage.setItem("isAuthenticated", "false");

    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const getPageName = (path) => {
    if (path.startsWith("/ticket/")) return "Ticket Details";

    switch (path) {
      case "/dashboard":
        return "User Dashboard";
      case "/admindashboard": // ✅ Added Admin Dashboard
        return "Admin Dashboard";
      case "/csrdashboard": // ✅ Added Admin Dashboard
        return "Employee Dashboard";
      case "/tickets":
        return "My Tickets";
      case "/settings":
        return "Settings";
      case "/profile":
        return "Profile";
      case "/home":
        return "Home";
      case "/assigntickets":
        return "Assign Tickets";
        case "/managetickets":
          return "Manage Tickets";
          case "/manageemployee":
            return "Manage Employee";
      case "/tickets/closed":
        return "Closed Tickets";
        case "/UserRequest":
        return "User Requests ";
        case "/employeeticketlist":
          return "Assigned Tickets ";
      default:
        return "Page Not Found";
    }
  };

  const pageName = getPageName(location.pathname);

  return (
    <>
      <nav className="navbar flex items-center justify-between px-4 py-2 bg-gray-800">
        {/* Hamburger menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="block lg:hidden text-white"
        >
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
                      <li
                        key={notification.id}
                        className="py-2 border-b border-gray-200 last:border-b-0"
                      >
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
            <div className="flex items-center justify-between w-full profile-section">
              {/* Username and Role (Left) */}
              <div className="user-info text-white" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <p className="username font-bold" style={{ whiteSpace: "nowrap" }}>{username}</p>
                <p className="user-role text-sm text-gray-300" style={{ whiteSpace: "nowrap" }}>{role}</p>
              </div>

              {/* Profile Picture (Right) - Clickable */}
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen); // Toggle profile menu
                  setNotificationsOpen(false); // Close notifications if open
                }}
                className="focus:outline-none"
              >
                {profilePicture && (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginLeft: "10px",
                      overflow: "hidden", // Ensures the image is clipped to the circle
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={profilePicture}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", // Ensures the image covers the area without distortion
                      }}
                    />
                  </div>
                )}
              </button>
            </div>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out">
                <ul className="py-2">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={() => setProfileModalOpen(true)} // Open modal instead of navigating
                  >
                    <FiUser className="text-gray-700" />
                    <span className="text-sm text-gray-700">View Profile</span>
                  </li>

                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    onClick={handleLogout}
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

      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} />
      {profileModalOpen && (
        <ProfileModal
          onClose={() => setProfileModalOpen(false)}
          onProfileUpdate={handleProfileUpdate} // Pass callback to ProfileModal
        />
      )}
    </>
  );
};

export default Navbar;