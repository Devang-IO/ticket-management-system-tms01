import React from "react";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-600 to-purple-700 text-white">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 py-4 absolute top-0">
        <h1 className="text-2xl font-bold">QuickAssist</h1>
        <div className="space-x-4">
          <Link to="/login">
            <button className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600">
              Signup
            </button>
          </Link>
        </div>
      </nav>

      {/* Header Section */}
      <div className="text-center mt-20">
        <h2 className="text-4xl font-bold mb-3">How Can We Help You?</h2>
        <p className="text-lg opacity-90">Have questions? Search through our Help Center.</p>

        {/* Search Bar */}
        <div className="mt-6 flex items-center bg-white rounded-full px-5 py-3 w-[400px] mx-auto">
          <input
            type="text"
            placeholder="Start typing your search..."
            className="flex-grow text-black outline-none"
          />
          <button className="px-4 py-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-600">
            Search
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-10">
        <div className="bg-white text-black p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-bold">How to use QuickAssist</h3>
          <p className="mt-2 text-sm">Helpful information on how to use QuickAssist.</p>
        </div>
        <div className="bg-white text-black p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-bold">Community Forums</h3>
          <p className="mt-2 text-sm">Ask questions and share your ideas!</p>
        </div>
        <div className="bg-white text-black p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-bold">Ticket System</h3>
          <p className="mt-2 text-sm">Built to help solve issues faster than ever.</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
