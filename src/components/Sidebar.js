import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`h-screen bg-gray-800 text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 fixed top-0 left-0 pt-16`}>
      <button
        className="p-2 text-gray-300 hover:text-white absolute top-4 right-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "←" : "→"}
      </button>

      <ul className="mt-10 space-y-6">
        <li>
          <Link to="/dashboard" className="block p-4 hover:bg-gray-700">Dashboard</Link>
        </li>
        <li>
          <Link to="/tickets" className="block p-4 hover:bg-gray-700">My Tickets</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
