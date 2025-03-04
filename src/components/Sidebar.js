import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiPlusCircle, FiCheckCircle, FiSettings, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SettingsModal from './SettingsModel';
import { Link } from 'react-router-dom';

const Sidebar = ({ isAdmin, onOpenTicket }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully!', {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    setTimeout(() => {
      navigate('/login');
    }, 1600);
  };

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

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
            <button onClick={onOpenTicket} className="sidebar-item w-full">
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

        {/* Settings Above Logout When Sidebar is Closed */}
        <div className={`sidebar-footer ${isOpen ? '' : 'sidebar-footer-closed'}`}>
          <button onClick={openSettingsModal} className="sidebar-item settings-btn">
            <FiSettings size={20} />
            {isOpen && <span className="sidebar-item-text">Settings</span>}
          </button>

          <button onClick={handleLogout} className="sidebar-item logout-btn">
            <FiLogOut size={20} />
            {isOpen && <span className="sidebar-item-text">Logout</span>}
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
    </>
  );
}

export default Sidebar;
