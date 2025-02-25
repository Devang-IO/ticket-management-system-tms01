import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TicketSubmissionModal from "../components/TicketSubmissionModal";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/global.css";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Sample data for the user's ticket statuses
  const ticketData = [
    { name: "Pending", value: 8, color: "#FFA500" },
    { name: "Resolved", value: 18, color: "#28A745" },
    { name: "In Progress", value: 1, color: "#007BFF" },
    { name: "Urgent", value: 2, color: "#DC3545" },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar onOpenTicket={() => setIsModalOpen(true)} />

      <div className="dashboard-main">
        {/* Navbar */}
        <Navbar />

        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          <h1 className="dashboard-title">My Dashboard</h1>

          {/* Overview Cards */}
          <div className="overview-cards">
            {["Open Tickets", "Closed Tickets", "In Progress", "Pending Tickets"].map(
              (status, index) => (
                <div key={index} className="card">
                  <h2 className="card-title">{status}</h2>
                  <p className="card-value" style={{ color: ticketData[index].color }}>
                    {ticketData[index].value}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Charts & Activity Section (side-by-side) */}
          <div className="charts-activity">
            {/* Pie Chart Card */}
            <div className="chart-card">
              <h2 className="chart-title">Your Ticket Status Distribution</h2>
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

            {/* Recent Ticket Updates Card */}
            <div className="activity-card">
              <h2 className="activity-title">Recent Ticket Updates</h2>
              <ul className="activity-list">
                <li>
                  <span className="list-bullet" />Your ticket <strong>"Login Issue"</strong> is now{" "}
                  <em>In Progress</em>.
                </li>
                <li>
                  <span className="list-bullet" />Your ticket <strong>"Password Reset"</strong> was
                  closed.
                </li>
                <li>
                  <span className="list-bullet" />Your ticket <strong>"UI Bug in Dashboard"</strong>{" "}
                  is pending review.
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="action-button btn-create-ticket"
              onClick={() => setIsModalOpen(true)}
            >
              Create Ticket
            </button>
            <Link to="/tickets" className="action-button btn-view-reports">
              View Tickets
            </Link>
          </div>
        </div>
      </div>

      {/* Ticket Submission Modal */}
      {isModalOpen && (
        <TicketSubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
