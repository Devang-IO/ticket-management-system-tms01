import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiHome, FiFileText, FiPlusCircle, FiCheckCircle, FiSettings, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import TicketSubmissionModal from "./TicketSubmissionModal"; // Import the modal

const Sidebar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar open/close state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false); // Modal open/close state
  const location = useLocation();

  // Function to open the ticket submission modal
  const handleOpenTicketModal = () => {
    setIsTicketModalOpen(true);
  };

  // Function to close the ticket submission modal
  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
          <button onClick={() => setIsSettingsModalOpen(true)} className="sidebar-item settings-btn">
            <FiSettings size={20} />
            {isOpen && <span className="sidebar-item-text">Settings</span>}
          </button>
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