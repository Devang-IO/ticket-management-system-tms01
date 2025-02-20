import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaHome, FaTicketAlt, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation(); // Get current route

  return (
    <aside
      className={`h-screen bg-gray-800 text-white ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 fixed top-0 left-0 pt-16 flex flex-col justify-between`}
    >
      {/* Toggle Button */}
      <button
        className="p-2 text-gray-300 hover:text-white absolute top-4 right-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "←" : "→"}
      </button>

      {/* Navigation Links */}
      <ul className="mt-10 space-y-6 flex-1">
        <li className={`${location.pathname === "/dashboard" ? "bg-gray-700" : ""}`}>
          <Link to="/dashboard" className="flex items-center p-4 hover:bg-gray-700">
            <FaHome className="mr-3" /> {isOpen && "Dashboard"}
          </Link>
        </li>
        <li className={`${location.pathname === "/tickets" ? "bg-gray-700" : ""}`}>
          <Link to="/tickets" className="flex items-center p-4 hover:bg-gray-700">
            <FaTicketAlt className="mr-3" /> {isOpen && "My Tickets"}
          </Link>
        </li>
      </ul>

      {/* Logout Button */}
      <div className="p-4">
        <button className="flex items-center w-full p-3 bg-red-600 hover:bg-red-700 rounded">
          <FaSignOutAlt className="mr-3" /> {isOpen && "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


