import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiPlusCircle, FiCheckCircle, FiSettings, FiUsers, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SettingsModal from './SettingsModel';
import { Link } from 'react-router-dom';

const Sidebar = ({ isAdmin, onOpenTicket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State to open/close modal
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = () => {
    localStorage.removeItem('user');

    // Show toast immediately before navigating
    toast.success('Logged out successfully!', {
      position: 'top-center',
      autoClose: 1500, // Increased duration
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Delay navigation slightly to allow the toast to display
    setTimeout(() => {
      navigate('/login');
    }, 1600);
  };

  const openSettingsModal = () => setIsSettingsModalOpen(true); // Open modal
  const closeSettingsModal = () => setIsSettingsModalOpen(false); // Close modal

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <ul className="sidebar-list">
          <li className="sidebar-title">
            {isOpen && <span className="title-text">QuickAssist</span>}
          </li>
          
          {/* Collapse Button */}
          <li>
            <button className="collapse-btn" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiArrowLeftCircle size={24} /> : <FiArrowRightCircle size={24} />}
            </button>
          </li>

          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={`sidebar-item ${location.pathname === "/dashboard" ? "sidebar-item-active" : ""}`}
            >
              <FiHome size={20} />
              {isOpen && <span className="sidebar-item-text">Dashboard</span>}
            </Link>
          </li>

          {/* My Tickets */}
          <li>
            <Link
              to="/tickets"
              className={`sidebar-item ${location.pathname === "/tickets" ? "sidebar-item-active" : ""}`}
            >
              <FiFileText size={20} />
              {isOpen && <span className="sidebar-item-text">My Tickets</span>}
            </Link>
          </li>

          {/* Create Ticket */}
          <li>
            <button onClick={onOpenTicket} className="sidebar-item w-full">
              <FiPlusCircle size={20} />
              {isOpen && <span className="sidebar-item-text">Create Ticket</span>}
            </button>
          </li>

          {/* Closed Tickets */}
          <li>
            <Link
              to="/tickets/closed"
              className={`sidebar-item ${location.pathname === "/tickets/closed" ? "sidebar-item-active" : ""}`}
            >
              <FiCheckCircle size={20} />
              {isOpen && <span className="sidebar-item-text">Closed Tickets</span>}
            </Link>
          </li>

          {/* Admin Panel (If Admin) */}
          {isAdmin && (
            <>
              {isOpen && <li className="sidebar-admin-title">Admin Panel</li>}
              <li>
                <Link
                  to="/admin/users"
                  className={`sidebar-item ${location.pathname === "/admin/users" ? "sidebar-item-active" : ""}`}
                >
                  <FiUsers size={20} />
                  {isOpen && <span className="sidebar-item-text">Manage Users</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/tickets"
                  className={`sidebar-item ${location.pathname === "/admin/tickets" ? "sidebar-item-active" : ""}`}
                >
                  <FiSettings size={20} />
                  {isOpen && <span className="sidebar-item-text">Manage Tickets</span>}
                </Link>
              </li>
            </>
          )}

          {/* Logout Button */}
          <li className="sidebar-item-logout">
            <button onClick={handleLogout} className="logout-btn w-full">
              <FiLogOut size={20} />
              {isOpen && <span className="sidebar-item-text">Logout</span>}
            </button>
          </li>

          {/* Settings Button - Opens Modal */}
          <li className="sidebar-item-settings">
            <button
              onClick={openSettingsModal}
              className={`sidebar-item ${location.pathname === "/settings" ? "sidebar-item-active" : ""}`}
            >
              <FiSettings size={20} />
              {isOpen && <span className="sidebar-item-text">Settings</span>}
            </button>
          </li>
        </ul>
      </aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
    </>
  );
}
export default Sidebar;