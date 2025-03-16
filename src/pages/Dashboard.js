import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TicketSubmissionModal from "../components/TicketSubmissionModal";
import RatingModal from "../components/RatingModal"; // Import the rating modal
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/global.css";
import { supabase } from "../utils/supabase";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ratingTicket, setRatingTicket] = useState(null); // Store the closed ticket that needs a rating
  const navigate = useNavigate();

  // Theme Colors
  const themeColors = {
    primary: "#23486A",
    secondary: "#3B6790",
    highlight: "#EFB036",
    text: "#4C7B8B",
  };

  // Fetch current user's tickets from the backend
  useEffect(() => {
    const fetchTickets = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data);
      }
    };

    fetchTickets();
  }, []);

  // Check for any closed ticket that has not been rated
  useEffect(() => {
    const checkForUnratedTickets = async () => {
      // Filter for closed tickets
      const closedTickets = tickets.filter(ticket => ticket.status === "closed");
      if (closedTickets.length === 0) {
        setRatingTicket(null);
        return;
      }
      // Get the ids of all closed tickets
      const closedTicketIds = closedTickets.map(ticket => ticket.id);

      // Query the employee_ratings table for any ratings for these ticket ids
      const { data: ratingsData, error } = await supabase
        .from("employee_ratings")
        .select("ticket_id")
        .in("ticket_id", closedTicketIds);

      if (error) {
        console.error("Error fetching ratings:", error);
        return;
      }
      // Create an array of ticket ids that have been rated
      const ratedTicketIds = ratingsData.map(r => r.ticket_id);
      // Find closed tickets that haven't been rated
      const unratedTickets = closedTickets.filter(ticket => !ratedTicketIds.includes(ticket.id));

      if (unratedTickets.length > 0) {
        // Show the modal for the first unrated closed ticket
        setRatingTicket(unratedTickets[0]);
      } else {
        setRatingTicket(null);
      }
    };

    if (tickets.length > 0) {
      checkForUnratedTickets();
    }
  }, [tickets]);

  // Compute counts for each ticket category based on status and priority
  const pendingCount = tickets.filter((ticket) => ticket.status === "open").length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === "closed").length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === "answered").length;
  // Ensure case-insensitive comparison for urgent tickets
  const urgentCount = tickets.filter(
    (ticket) => ticket.priority && ticket.priority.toLowerCase() === "high"
  ).length;

  // Create data for overview cards and the bar chart
  const ticketData = [
    { name: "Pending", value: pendingCount },
    { name: "Resolved", value: resolvedCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Urgent", value: urgentCount },
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

  // Callback when the rating modal is closed (after successful rating submission)
  const handleRatingModalClose = () => {
    setRatingTicket(null);
  };

  return (
    <div className="dashboard-container" style={{ backgroundColor: "#F4F6F8" }}>
      {/* Removed extra Sidebar */}
      <div className="dashboard-main">
        {/* Navbar */}
        <Navbar style={{ backgroundColor: themeColors.primary, color: "white" }} />

        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          <h1 className="dashboard-title" style={{ color: themeColors.primary }}>
            My Dashboard
          </h1>

          {/* Overview Cards */}
          <div className="overview-cards">
            {ticketData.map((ticket, index) => (
              <div
                key={index}
                className="card"
                style={{
                  backgroundColor: themeColors.secondary,
                  color: themeColors.highlight,
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                }}
              >
                <h2 className="card-title">{ticket.name}</h2>
                <p className="card-value">{ticket.value}</p>
              </div>
            ))}
          </div>

          {/* Bar Chart & Recent Updates */}
          <div className="charts-activity">
            {/* Bar Chart */}
            <div className="chart-card" style={{ borderRadius: "8px", overflow: "hidden" }}>
              <h2 className="chart-title" style={{ color: themeColors.text }}>
                Your Ticket Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ticketData}>
                  <XAxis dataKey="name" stroke={themeColors.primary} />
                  <YAxis stroke={themeColors.primary} />
                  <Tooltip />
                  <Bar dataKey="value" fill={themeColors.highlight} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* How to Create a Ticket */}
            <div
              className="activity-card"
              style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "95%",
              }}
            >
              <h2
                className="activity-title"
                style={{
                  color: themeColors.text,
                  marginBottom: "20px",
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                Need Help? Create a Support Ticket
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  textAlign: "center",
                  maxWidth: "600px",
                }}
              >
                If you’re facing any issues or need assistance, our support team is here to help!
                Submitting a ticket is quick and easy.
              </p>
              <ul
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  textAlign: "left",
                  maxWidth: "600px",
                  marginTop: "16px",
                  paddingLeft: "20px",
                }}
              >
                <li>
                  Navigate to the <strong>"Create Ticket"</strong> option in the sidebar.
                </li>
                <li>
                  Fill in the details of your issue, providing as much information as possible.
                </li>
                <li>
                  Click <strong>"Submit"</strong> to send your request to our support team.
                </li>
                <li>
                  Track the status of your requests in the <strong>"My Tickets"</strong> section.
                </li>
              </ul>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  textAlign: "center",
                  maxWidth: "600px",
                  marginTop: "16px",
                }}
              >
                Providing detailed information helps us resolve your issue faster.
                We strive to respond to all tickets promptly. Thank you for reaching out!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="quick-actions"
            style={{
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
            }}
          >
            {/* Create Ticket Button */}
            <button
              className="action-button transition-all duration-300"
              style={{
                backgroundColor: themeColors.secondary,
                color: "#EFB036",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = themeColors.highlight;
                e.target.style.color = "#3B6790";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = themeColors.secondary;
                e.target.style.color = "#EFB036";
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
                color: "#EFB036",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = themeColors.highlight;
                e.target.style.color = "#3B6790";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = themeColors.secondary;
                e.target.style.color = "#EFB036";
              }}
            >
              View Tickets
            </Link>
          </div>
        </div>
      </div>
      {/* Ticket Submission Modal */}
      {isModalOpen && (
        <TicketSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTicketSubmit}
        />
      )}
      {/* Rating Modal - shows if there is a closed, unrated ticket */}
      {ratingTicket && (
        <RatingModal
          show={true}
          onClose={handleRatingModalClose}
          employeeId={ratingTicket.closed_by} // The employee who closed the ticket
          ticketId={ratingTicket.id}
        />
      )}
    </div>
  );
};

export default Dashboard;
