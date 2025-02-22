import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Dashboard from "./Dashboard"; // Import Dashboard

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="p-6 mt-16 w-full">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} /> {/* Render Dashboard */}
            {/* Add other routes inside Home if needed */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
