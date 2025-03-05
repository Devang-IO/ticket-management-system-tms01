import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FiHome, FiFileText, FiPlusCircle, FiCheckCircle, FiSettings, FiArrowLeftCircle, FiArrowRightCircle, FiSun, FiMoon } from "react-icons/fi";
import { Link } from "react-router-dom";
import TicketSubmissionModal from "./TicketSubmissionModal"; // Import the ticket submission modal

const Sidebar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar open/close state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false); // Ticket modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // Settings modal state
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state
  const location = useLocation();

  // Ref for the settings modal
  const settingsModalRef = useRef(null);

  // Function to open the ticket submission modal
  const handleOpenTicketModal = () => {
    setIsTicketModalOpen(true);
  };

  // Function to close the ticket submission modal
  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
  };

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode); // Apply dark mode to the entire app
  };

  // Close settings modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsModalRef.current &&
        !settingsModalRef.current.contains(event.target) &&
        !event.target.closest(".settings-btn") // Exclude the settings button
      ) {
        setIsSettingsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white`}>
        <div className="sidebar-header">
          {isOpen && <span className="sidebar-title">QuickAssist</span>}
          <button className="collapse-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiArrowRightCircle size={24} /> : <FiArrowLeftCircle size={24} />}
          </button>
        </div>

        <ul className="sidebar-list">
          <li>
            <Link to="/dashboard" className={`sidebar-item ${location.pathname === "/dashboard" ? "sidebar-item-active" : ""}`}>
              <FiHome size={20} />
              {isOpen && <span className="sidebar-item-text">Dashboard</span>}
            </Link>
          </li>

          <li>
            <Link to="/tickets" className={`sidebar-item ${location.pathname === "/tickets" ? "sidebar-item-active" : ""}`}>
              <FiFileText size={20} />
              {isOpen && <span className="sidebar-item-text">My Tickets</span>}
            </Link>
          </li>

          <li>
            <button onClick={handleOpenTicketModal} className="sidebar-item w-full">
              <FiPlusCircle size={20} />
              {isOpen && <span className="sidebar-item-text">Create Ticket</span>}
            </button>
          </li>

          <li>
            <Link to="/tickets/closed" className={`sidebar-item ${location.pathname === "/tickets/closed" ? "sidebar-item-active" : ""}`}>
              <FiCheckCircle size={20} />
              {isOpen && <span className="sidebar-item-text">Closed Tickets</span>}
            </Link>
          </li>
        </ul>

        {/* Settings Section */}
        <div className={`sidebar-footer ${isOpen ? '' : 'sidebar-footer-closed'}`}>
          <button
            onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
            className="sidebar-item settings-btn relative"
          >
            <FiSettings size={20} />
            {isOpen && <span className="sidebar-item-text">Settings</span>}
          </button>

          {/* Settings Popup Modal */}
          {isSettingsModalOpen && (
            <div
              ref={settingsModalRef}
              className={`absolute ${
                isOpen ? "left-16" : "left-12" // Adjust position based on sidebar state
              } bottom-16 bg-white dark:bg-gray-800 w-64 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50`}
            >
              <div className="flex justify-between items-center mb-4">
              </div>

              {/* Light/Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-white">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    isDarkMode ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      isDarkMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Render the TicketSubmissionModal */}
      <TicketSubmissionModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
      />
    </>
  );
};

export default Sidebar;