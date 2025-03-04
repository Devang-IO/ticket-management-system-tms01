import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TicketSubmissionModal from "../components/TicketSubmissionModal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/global.css";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Theme Colors
  const themeColors = {
    primary: "#23486A",
    secondary: "#3B6790",
    highlight: "#EFB036",
    text: "#4C7B8B",
  };

  // Sample data for the user's ticket statuses
  const ticketData = [
    { name: "Pending", value: 8 },
    { name: "Resolved", value: 18 },
    { name: "In Progress", value: 1 },
    { name: "Urgent", value: 2 },
  ];

  // Function to handle ticket submission
  const handleTicketSubmit = () => {
    toast.success("Ticket submitted successfully!", {
      position: "top-center",
      autoClose: 2000,
    });
    setTimeout(() => {
      setIsModalOpen(false);
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="dashboard-container" style={{ backgroundColor: "#F4F6F8" }}>
      {/* Sidebar */}
      <Sidebar onOpenTicket={() => setIsModalOpen(true)} style={{ backgroundColor: themeColors.primary }} />

      <div className="dashboard-main">
        {/* Navbar */}

        <Navbar style={{ backgroundColor: themeColors.primary, color: "white" }} />

        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          <h1 className="dashboard-title" style={{ color: themeColors.primary }}>My Dashboard</h1>

          {/* Overview Cards */}
          <div className="overview-cards">
            {ticketData.map((ticket, index) => (
              <div key={index} className="card" style={{ backgroundColor: themeColors.secondary, color: themeColors.highlight, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", borderRadius: "8px" }}>
                <h2 className="card-title">{ticket.name}</h2>
                <p className="card-value">{ticket.value}</p>
              </div>
            ))}
          </div>

          {/* Bar Chart & Recent Updates */}
          <div className="charts-activity">
            {/* Bar Chart */}
            <div className="chart-card" style={{ borderRadius: "8px", overflow: "hidden" }}>
              <h2 className="chart-title" style={{ color: themeColors.text }}>Your Ticket Status Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ticketData}>
                  <XAxis dataKey="name" stroke={themeColors.primary} />
                  <YAxis stroke={themeColors.primary} />
                  <Tooltip />
                  <Bar dataKey="value" fill={themeColors.highlight} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Ticket Updates */}
            <div className="activity-card" style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px" }}>
              <h2 className="activity-title" style={{ color: themeColors.text }}>Recent Ticket Updates</h2>
              <ul className="activity-list">
                <li>
                  <span className="list-bullet" style={{ color: "#23486A" }} /> Your ticket <strong>"Login Issue"</strong> is now <em>In Progress</em>.
                </li>
                <li>
                  <span className="list-bullet" style={{ color: "#23486A" }} /> Your ticket <strong>"Password Reset"</strong> was closed.
                </li>
                <li>
                  <span className="list-bullet" style={{ color: "#23486A" }} /> Your ticket <strong>"UI Bug in Dashboard"</strong> is pending review.
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions"  style={{
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" , borderRadius: "8px"}}>
            {/* Create Ticket Button */}
            <button
              className="action-button transition-all duration-300"
              style={{
                backgroundColor: themeColors.secondary,
                color: "#EFB036"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = themeColors.highlight;
                e.target.style.color = "#3B6790"; 
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = themeColors.secondary;
                e.target.style.color = "#EFB036"
              }}
              onClick={() => setIsModalOpen(true)}
            >
              Create Ticket
            </button>

            {/* View Tickets Button */}
            <Link
              to="/tickets"
              className="action-button transition-all duration-300"
              style={{
                backgroundColor: themeColors.secondary,
                color: "#EFB036"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = themeColors.highlight;
                e.target.style.color = "#3B6790"; 
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = themeColors.secondary;
                e.target.style.color = "#EFB036"
              }}            >
              View Tickets
            </Link>
          </div>

        </div>
      </div>

      {/* Ticket Submission Modal */}
      {isModalOpen && (
        <TicketSubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleTicketSubmit} />
      )}
    </div>
  );
};

export default Dashboard;
