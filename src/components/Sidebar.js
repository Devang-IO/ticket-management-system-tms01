import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FiHome, FiFileText, FiPlusCircle, FiCheckCircle, FiSettings, FiArrowLeftCircle, FiArrowRightCircle, FiSun, FiMoon } from "react-icons/fi";
import { Link } from "react-router-dom";
import TicketSubmissionModal from "./TicketSubmissionModal";

const Sidebar = ({ sidebarOpen, setSidebarOpen, isAdmin }) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const location = useLocation();
  const settingsModalRef = useRef(null);

  const handleOpenTicketModal = () => setIsTicketModalOpen(true);
  const handleCloseTicketModal = () => setIsTicketModalOpen(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsModalRef.current &&
        !settingsModalRef.current.contains(event.target) &&
        !event.target.closest(".settings-btn")
      ) {
        setIsSettingsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <span className="sidebar-title">QuickAssist</span>}
          <button className="collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiArrowRightCircle size={24} /> : <FiArrowLeftCircle size={24} />}
          </button>
        </div>

        <ul className="sidebar-list">
          <li>
            <Link to="/dashboard" className={`sidebar-item ${location.pathname === "/dashboard" ? "sidebar-item-active" : ""}`}>
              <FiHome size={20} />
              {sidebarOpen && <span className="sidebar-item-text">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/tickets" className={`sidebar-item ${location.pathname === "/tickets" ? "sidebar-item-active" : ""}`}>
              <FiFileText size={20} />
              {sidebarOpen && <span className="sidebar-item-text">My Tickets</span>}
            </Link>
          </li>
          <li>
            <button onClick={handleOpenTicketModal} className="sidebar-item w-full">
              <FiPlusCircle size={20} />
              {sidebarOpen && <span className="sidebar-item-text">Create Ticket</span>}
            </button>
          </li>
          <li>
            <Link to="/tickets/closed" className={`sidebar-item ${location.pathname === "/tickets/closed" ? "sidebar-item-active" : ""}`}>
              <FiCheckCircle size={20} />
              {sidebarOpen && <span className="sidebar-item-text">Closed Tickets</span>}
            </Link>
          </li>
        </ul>

        <div className={`sidebar-footer ${sidebarOpen ? "" : "sidebar-footer-closed"}`}>
          <button onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)} className="sidebar-item settings-btn relative">
            <FiSettings size={20} />
            {sidebarOpen && <span className="sidebar-item-text">Settings</span>}
          </button>
          {isSettingsModalOpen && (
            <div ref={settingsModalRef} className={`absolute ${sidebarOpen ? "left-16" : "left-12"} bottom-16 settings-modal`}>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <button onClick={toggleDarkMode} className={`dark-mode-toggle ${isDarkMode ? "dark" : "light"}`}>
                  <div className={`toggle-thumb ${isDarkMode ? "toggle-on" : "toggle-off"}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <TicketSubmissionModal isOpen={isTicketModalOpen} onClose={handleCloseTicketModal} />
    </>
  );
};

export default Sidebar;