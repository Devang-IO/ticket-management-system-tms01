import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiFileText, FiPlusCircle, FiCheckCircle, FiSettings, FiUsers, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi"; // Importing icons

const Sidebar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(true); 

  return (
    <aside className={`h-screen bg-gray-800 text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 fixed top-0 left-0 pt-16`}>
      <ul className="mt-4 space-y-6">
        {/* Collapse Button */}
        <li>
          <button
            className="p-2 text-gray-300 hover:text-white flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiArrowLeftCircle size={24} /> : <FiArrowRightCircle size={24} />}
          </button>
        </li>

        {/* Dashboard */}
        <li>
          <Link to="/dashboard" className="flex items-center p-4 hover:bg-gray-700">
            <FiHome size={20} />
            {isOpen && <span className="ml-4">Dashboard</span>}
          </Link>
        </li>

        {/* My Tickets */}
        <li>
          <Link to="/tickets" className="flex items-center p-4 hover:bg-gray-700">
            <FiFileText size={20} />
            {isOpen && <span className="ml-4">My Tickets</span>}
          </Link>
        </li>

        {/* Create Ticket */}
        <li>
          <Link to="/tickets/new" className="flex items-center p-4 hover:bg-gray-700">
            <FiPlusCircle size={20} />
            {isOpen && <span className="ml-4">Create Ticket</span>}
          </Link>
        </li>

        {/* Ticket Details */}
        <li>
          <Link to="/tickets/:id" className="flex items-center p-4 hover:bg-gray-700">
            <FiCheckCircle size={20} />
            {isOpen && <span className="ml-4">Ticket Details</span>}
          </Link>
        </li>

        {/* Closed Tickets */}
        <li>
          <Link to="/tickets/closed" className="flex items-center p-4 hover:bg-gray-700">
            <FiCheckCircle size={20} />
            {isOpen && <span className="ml-4">Closed Tickets</span>}
          </Link>
        </li>

        {/* Admin Panel (If Admin) */}
        {isAdmin && (
          <>
            <li className="text-gray-400 mt-6">{isOpen && "Admin Panel"}</li>
            <li>
              <Link to="/admin/users" className="flex items-center p-4 hover:bg-gray-700">
                <FiUsers size={20} />
                {isOpen && <span className="ml-4">Manage Users</span>}
              </Link>
            </li>
            <li>
              <Link to="/admin/tickets" className="flex items-center p-4 hover:bg-gray-700">
                <FiSettings size={20} />
                {isOpen && <span className="ml-4">Manage Tickets</span>}
              </Link>
            </li>
          </>
        )}

        {/* Logout */}
        <li className="mt-6">
          <Link to="/logout" className="flex items-center p-4 hover:bg-gray-700">
            <FiLogOut size={20} />
            {isOpen && <span className="ml-4">Logout</span>}
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
