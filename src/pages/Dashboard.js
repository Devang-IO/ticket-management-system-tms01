import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Sample data for the pie chart
  const ticketData = [
    { name: "Pending", value: 15, color: "#FFA500" },
    { name: "Resolved", value: 105, color: "#28A745" },
    { name: "In Progress", value: 30, color: "#007BFF" },
    { name: "Urgent", value: 5, color: "#DC3545" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />
        
        {/* Main Dashboard Content */}
        <div className="p-6 mt-16">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {["Pending", "Resolved", "In Progress", "Urgent"].map((status, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-semibold">{status} Tickets</h2>
                <p className="text-xl font-bold" style={{ color: ticketData[index].color }}>
                  {ticketData[index].value}
                </p>
              </div>
            ))}
          </div>
          
          {/* Charts & Activity Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Ticket Status Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ticketData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <ul className="list-disc pl-5 mt-2">
                <li>User X opened a ticket: "Login Issue"</li>
                <li>Admin resolved a ticket: "Payment Failure"</li>
                <li>User Y reported a "UI Bug"</li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6 flex space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Ticket</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


