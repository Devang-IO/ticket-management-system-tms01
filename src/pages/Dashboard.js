import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-6 ml-20 md:ml-64 mt-16">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-700">Welcome to the Ticket Management System!</p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
