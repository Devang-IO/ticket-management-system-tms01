import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaComments, FaTicketAlt } from "react-icons/fa";
import { motion } from "framer-motion";

// Image paths
const images = {
  "ticket-list": "/ticketdetail.jpg",
  "ticket-view": "/ticketview.png",
  "dashboard": "/dashboard.png",
};

const WelcomePage = () => {
  // Default active tab
  const [activeTab, setActiveTab] = useState("ticket-list");

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#23486A] to-[#3B6790] text-white">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 py-4 bg-[#EFB036] shadow-md">
  <div className="flex items-center gap-3">
    <img src="/logo.png" alt="QuickAssist Logo" className="h-10 w-10 object-contain" />
    <h1 className="text-2xl font-extrabold tracking-wide text-[#23486A]">
      QuickAssist
    </h1>
  </div>
        <div className="space-x-4">
          <Link to="/login">
            <button className="px-6 py-2 bg-[#23486A] text-[#EFB036] font-semibold rounded-full hover:bg-[#4C7B8B] transition duration-300">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2 bg-[#23486A] text-[#EFB036] font-semibold rounded-full hover:bg-[#4C7B8B] transition duration-300">
              Signup
            </button>
          </Link>
        </div>
      </nav>

      {/* Welcome Section with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="mt-16 px-6 md:px-10 lg:px-20 py-10 bg-[#4C7B8B] text-white rounded-xl shadow-lg max-w-4xl text-center"
      >
        <h2 className="text-4xl font-bold mb-4 text-[#EFB036]">
          Welcome to QuickAssist
        </h2>
        <p className="text-lg opacity-90">
          QuickAssist is a powerful helpdesk solution designed to simplify
          customer support. With an ticketing system, community
          forums, and an intuitive interface, we help businesses resolve issues
          faster and enhance customer satisfaction.
        </p>
      </motion.div>

      {/* Feature Section with Animation */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-10 max-w-6xl">
  {[
    { icon: <FaUsers />, title: "How to use QuickAssist", desc: "Learn how to navigate and use QuickAssist effectively." },
    { icon: <FaComments />, title: "Community Forums", desc: "Ask questions and share your ideas with others!" },
    { icon: <FaTicketAlt />, title: "Ticket System", desc: "Solve issues faster with our easy-to-use ticketing system." }
  ].map((item, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.1, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
      className="bg-[#4C7B8B] text-white p-6 rounded-3xl shadow-lg text-center transition-transform duration-300 cursor-pointer"
    >
      <div className="text-3xl text-[#EFB036] mx-auto mb-3">{item.icon}</div>
      <h3 className="text-xl font-bold">{item.title}</h3>
      <p className="mt-2 text-sm">{item.desc}</p>
    </motion.div>
  ))}
</div>


      {/* Get Started Button Below Feature Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-8"
      >
        <Link to="/register">
          <button className="px-8 py-3 bg-[#EFB036] text-[#23486A] font-semibold rounded-full hover:bg-[#FFD166] transition duration-300 shadow-lg">
            Get Started
          </button>
        </Link>
      </motion.div>

      {/* Discover QuickAssist Section */}
      <div className="mt-16 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-[#EFB036] text-center mb-6">
          Discover QuickAssist
        </h2>
        <div className="flex justify-center space-x-8 border-b-2 border-[#EFB036] pb-2">
          {Object.keys(images).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-gray-300 hover:text-[#EFB036] ${
                activeTab === tab
                  ? "text-[#EFB036] font-semibold border-b-2 border-[#EFB036] pb-1"
                  : ""
              }`}
            >
              {tab.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Image Container */}
      <div className="mt-8 bg-[#EFB036] p-6 rounded-3xl shadow-lg max-w-4xl w-full text-center">
        <img
          src={images[activeTab]}
          alt={activeTab}
          className="w-full rounded-3xl shadow-md"
        />
      </div>

      {/* Footer */}
      <footer className="w-full flex justify-center px-10 py-6 mt-12 bg-[#EFB036] text-[#23486A] shadow-md">
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} QuickAssist. All rights reserved.</p>
          <p className="text-sm opacity-80">
            Helping businesses solve issues, one ticket at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
