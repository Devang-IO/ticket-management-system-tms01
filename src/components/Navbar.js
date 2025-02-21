import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md fixed w-full top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="text-xl font-bold">
          Ticket System
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
