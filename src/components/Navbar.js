import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiBell, FiMenu, FiUser, FiLogOut, FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileModal from "./ProfileModal";
import SearchModal from "./SearchModal";

// Default user avatar as inline SVG for reliability
const DefaultAvatar = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
    <FiUser size={24} />
  </div>
);

const Navbar = ({ sidebarOpen }) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [role, setRole] = useState("User");
  const [profilePicture, setProfilePicture] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  // Memoize the fetchProfileData function to prevent unnecessary re-renders
  const fetchProfileData = useCallback(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedProfilePicture = localStorage.getItem("profilePicture");
    
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
    if (storedProfilePicture) {
      setProfilePicture(storedProfilePicture);
      setAvatarError(false); // Reset error state when new profile picture is set
    }
  }, []);

  // Use useEffect with empty dependency array to run only once on mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Callback function to update Navbar after profile edit
  const handleProfileUpdate = useCallback(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const notifications = [
    { id: 1, text: "Your ticket has been resolved.", time: "2 hours ago" },
    { id: 2, text: "New ticket assigned to you.", time: "5 hours ago" },
    { id: 3, text: "System maintenance scheduled.", time: "1 day ago" },
    { id: 4, text: "Your account has been updated.", time: "2 days ago" },
    { id: 5, text: "New feature released: Dark Mode.", time: "3 days ago" },
    { id: 6, text: "Reminder: Submit your weekly report.", time: "4 days ago" },
  ];

  const handleLogout = useCallback(() => {
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
  }, [navigate]);

  const getPageName = useCallback((path) => {
    if (path.startsWith("/ticket/")) return "Ticket Details";

    switch (path) {
      case "/dashboard":
        return "User Dashboard";
      case "/admindashboard":
        return "Admin Dashboard";
      case "/csrdashboard":
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
        return "User Requests";
      case "/employeeticketlist":
        return "Assigned Tickets";
      case "/admin/analytics":
        return "Analytics Dashboard";
      default:
        return "Page Not Found";
    }
  }, []);

  const pageName = getPageName(location.pathname);

  const handleSearchInputClick = useCallback(() => {
    setSearchModalOpen(true);
  }, []);

  const toggleProfileOpen = useCallback(() => {
    setProfileOpen(prev => !prev);
    setNotificationsOpen(false);
  }, []);

  const handleImageError = useCallback(() => {
    setAvatarError(true);
  }, []);

  return (
    <>
      <nav className="navbar flex items-center justify-between px-4 py-2 bg-gray-800 shadow-md">
        {/* Hamburger menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="block lg:hidden text-white"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>

        {/* Page title centered with icon */}
        <div className="flex items-center justify-center gap-2 w-full">
         
          <div className="page-title text-white font-semibold text-lg truncate max-w-xs">
            {pageName}
          </div>
        </div>

        {/* Navbar right side */}
        <div className="navbar-right flex items-center gap-2 md:gap-4 z-50">
          {/* Search input with icon */}
          <div className="relative flex items-center">
          
            <input
              type="text"
              placeholder="Search Tickets"
              onClick={handleSearchInputClick}
              className="search-input bg-gray-700 text-white pl-9 pr-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-32 md:w-auto"
              readOnly
            />
          </div>

          {/* Profile dropdown */}
          <div className="relative z-50">
            <div className="flex items-center justify-between profile-section z-50">
              {/* Username and Role (Left) - Hidden on small screens */}
              <div className="user-info text-white flex-col items-end hidden md:flex">
                <p className="username font-bold whitespace-nowrap">{username}</p>
                <p className="user-role text-sm text-gray-300 whitespace-nowrap">{role}</p>
              </div>

              {/* Profile Picture (Right) - Clickable */}
              <button
                onClick={toggleProfileOpen}
                className="focus:outline-none ml-2"
                aria-label="Open profile menu"
              >
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center bg-gray-600"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  {profilePicture && !avatarError ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <DefaultAvatar />
                  )}
                </div>
              </button>
            </div>
            {profileOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-[#FFF2D8] rounded-xl shadow-lg transform transition-all duration-300 ease-in-out z-[9999]">

    <ul className="py-2">
      <li
        className="px-4 py-2 hover:bg-[#EAD7BB] cursor-pointer flex items-center gap-2 z-50"
        onClick={() => {
          setProfileModalOpen(true);
          setProfileOpen(false);
        }}
      >
        <FiUser className="text-[#113946]" />
        <span className="text-sm text-[#113946]">View Profile</span>
      </li>

      <li
        className="px-4 py-2 hover:bg-[#EAD7BB] cursor-pointer flex items-center gap-2 z-50"
        onClick={handleLogout}
      >
        <FiLogOut className="text-[#113946]" />
        <span className="text-sm text-[#113946]">Logout</span>
      </li>
    </ul>
  </div>
)}
</div>
</div>
</nav>

{/* Toast Container */}
<ToastContainer position="top-center" autoClose={3000} />

{/* Profile Modal */}
{profileModalOpen && (
  <ProfileModal
    onClose={() => setProfileModalOpen(false)}
    onProfileUpdate={handleProfileUpdate}
  />
)}
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </>
  );
};

export default React.memo(Navbar);