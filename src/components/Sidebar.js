import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiPlusCircle,
  FiCheckCircle,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiArrowLeftCircle,
  FiArrowRightCircle,
} from "react-icons/fi";

const Sidebar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Logout Handler
  const handleLogout = () => {
    // Perform any logout operations like clearing tokens
    localStorage.removeItem("authToken"); // Example: Clearing auth token
    navigate("/login"); // Redirect to Login page
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <ul className="sidebar-list">
        {/* Collapse Button */}
        <li>
          <button className="collapse-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <FiArrowLeftCircle size={24} />
            ) : (
              <FiArrowRightCircle size={24} />
            )}
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
          <Link to="/tickets/new" className="sidebar-item">
            <FiPlusCircle size={20} />
            {isOpen && <span className="sidebar-item-text">Create Ticket</span>}
          </Link>
        </li>

        {/* Ticket Details */}
        <li>
          <Link to="/tickets/:id" className="sidebar-item">
            <FiCheckCircle size={20} />
            {isOpen && (
              <span className="sidebar-item-text">Ticket Details</span>
            )}
          </Link>
        </li>

        {/* Closed Tickets */}
        <li>
          <Link to="/tickets/closed" className="sidebar-item">
            <FiCheckCircle size={20} />
            {isOpen && (
              <span className="sidebar-item-text">Closed Tickets</span>
            )}
          </Link>
        </li>

        {/* Admin Panel (If Admin) */}
        {isAdmin && (
          <>
            <li className="sidebar-admin-title">{isOpen && "Admin Panel"}</li>
            <li>
              <Link to="/admin/users" className="sidebar-item">
                <FiUsers size={20} />
                {isOpen && (
                  <span className="sidebar-item-text">Manage Users</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/admin/tickets" className="sidebar-item">
                <FiSettings size={20} />
                {isOpen && (
                  <span className="sidebar-item-text">Manage Tickets</span>
                )}
              </Link>
            </li>
          </>
        )}

        {/* Logout */}
        <li className="sidebar-item-logout">
          <button className="sidebar-item" onClick={handleLogout}>
            <FiLogOut size={20} />
            {isOpen && <span className="sidebar-item-text">Logout</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
