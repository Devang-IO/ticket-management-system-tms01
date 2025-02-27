import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiFileText, FiPlusCircle, FiCheckCircle,
  FiSettings, FiUsers, FiLogOut, FiArrowLeftCircle,
  FiArrowRightCircle
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sidebar = ({ isAdmin, onOpenTicket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully!', {
      position: 'top-center',
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Delay navigation slightly to allow the toast to display
    setTimeout(() => {
      navigate('/login');
    }, 1200); // Increased delay to 1200ms
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <ul className="sidebar-list">
          {/* Collapse Button */}
          <li>
            <button className="collapse-btn" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiArrowLeftCircle size={24} /> : <FiArrowRightCircle size={24} />}
            </button>
          </li>

          {/* Dashboard */}
          <li>
            <Link to="/dashboard" className="sidebar-item">
              <FiHome size={20} />
              {isOpen && <span className="sidebar-item-text">Dashboard</span>}
            </Link>
          </li>

          {/* My Tickets */}
          <li>
            <Link to="/tickets" className="sidebar-item">
              <FiFileText size={20} />
              {isOpen && <span className="sidebar-item-text">My Tickets</span>}
            </Link>
          </li>

          {/* Create Ticket */}
          <li>
            <button onClick={onOpenTicket} className="sidebar-item">
              <FiPlusCircle size={20} />
              {isOpen && <span className="sidebar-item-text">Create Ticket</span>}
            </button>
          </li>

          {/* Closed Tickets */}
          <li>
            <Link to="/tickets/closed" className="sidebar-item">
              <FiCheckCircle size={20} />
              {isOpen && <span className="sidebar-item-text">Closed Tickets</span>}
            </Link>
          </li>

          {/* Admin Panel (If Admin) */}
          {isAdmin && (
            <>
              {isOpen && <li className="sidebar-admin-title">Admin Panel</li>}
              <li>
                <Link to="/admin/users" className="sidebar-item">
                  <FiUsers size={20} />
                  {isOpen && <span className="sidebar-item-text">Manage Users</span>}
                </Link>
              </li>
              <li>
                <Link to="/admin/tickets" className="sidebar-item">
                  <FiSettings size={20} />
                  {isOpen && <span className="sidebar-item-text">Manage Tickets</span>}
                </Link>
              </li>
            </>
          )}

          {/* Logout Button */}
          <li className="sidebar-item-logout">
            <button onClick={handleLogout} className="sidebar-item">
              <FiLogOut size={20} />
              {isOpen && <span className="sidebar-item-text">Logout</span>}
            </button>
          </li>
        </ul>
      </aside>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default Sidebar;
