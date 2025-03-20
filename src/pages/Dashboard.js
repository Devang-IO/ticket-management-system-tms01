import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TicketSubmissionModal from "../components/TicketSubmissionModal";
import RatingModal from "../components/RatingModal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/global.css";
import { supabase } from "../utils/supabase";

// Ticket closure confirmation modal component (resolution notes removed)
const TicketCloseConfirmModal = ({ ticket, onClose, onConfirm}) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#23486A] mb-4">Ticket Closure Request</h2>
        
        <p className="mb-4 text-gray-700">
          Support has requested to close your ticket: <strong>{ticket.title}</strong>
        </p>
        
        {/* Resolution notes section removed */}
        
        <p className="mb-6 text-gray-700">
          Are you satisfied with the solution? Confirming will close this ticket.
        </p>

        <div className="flex justify-end space-x-3">
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Not Yet
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#23486A] text-white rounded-md hover:bg-[#3B6790] transition"
          >
            Yes, Close Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ratingTicket, setRatingTicket] = useState(null);
  const [closureTicket, setClosureTicket] = useState(null);
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

  // Check for any tickets with closure requested that need confirmation
  useEffect(() => {
    const checkForClosureRequests = () => {
      // Filter for tickets with closure requested
      const closureRequests = tickets.filter(ticket => ticket.status === "requested");
      if (closureRequests.length > 0) {
        // Show the closure confirmation modal for the first ticket
        setClosureTicket(closureRequests[0]);
      } else {
        setClosureTicket(null);
      }
    };

    if (tickets.length > 0) {
      checkForClosureRequests();
    }
  }, [tickets]);

  // Check for any closed ticket that has not been rated (only check if no closure request is pending)
  useEffect(() => {
    const checkForUnratedTickets = async () => {
      // Don't check for ratings if we have a closure request pending
      if (closureTicket) {
        setRatingTicket(null);
        return;
      }

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
  }, [tickets, closureTicket]);

  // Handle confirmation of ticket closure
  const handleConfirmClosure = async () => {
    if (!closureTicket) return;
    
    try {
      // Update ticket status to closed
      const { error } = await supabase
        .from("tickets")
        .update({ status: "closed" })
        .eq("id", closureTicket.id);

      if (error) {
        console.error("Error closing ticket:", error);
        toast.error("Failed to close ticket. Please try again.");
        return;
      }

      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === closureTicket.id ? { ...ticket, status: "closed" } : ticket
        )
      );
      
      toast.success("Ticket closed successfully");
      
      // Clear the closure ticket (closing this modal)
      setClosureTicket(null);
      
    } catch (error) {
      console.error("Error in handleConfirmClosure:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Callback when the rating modal is closed (after successful rating submission)
  const handleRatingModalClose = () => {
    setRatingTicket(null);
  };

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
                If you're facing any issues or need assistance, our support team is here to help!
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
      
      {/* Ticket Close Confirmation Modal - shows first */}
      {closureTicket && (
        <TicketCloseConfirmModal
          ticket={closureTicket}
          onClose={() => setClosureTicket(null)}
          onConfirm={handleConfirmClosure}
        />
      )}
      
      {/* Rating Modal - shows after closure is confirmed */}
      {ratingTicket && !closureTicket && (
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
