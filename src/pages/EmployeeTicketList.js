import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

const priorityStyles = {
  High: "bg-[#EFB036]",
  Medium: "bg-[#3B6790]",
  Low: "bg-[#4C7B8B]",
  Critical: "bg-[#23486A]",
};

const EmployeeTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ticketToClose, setTicketToClose] = useState(null);
  const navigate = useNavigate();

  // Ref to track which tickets have already triggered an email
  const notifiedTicketIdsRef = useRef(new Set());

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch assignments joined with the related ticket data (including closed_by, name, email)
      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, closed_by, name, email)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        // Map assignments to extract the ticket object
        const assignedTickets = data.map((assignment) => assignment.ticket);
        setTickets(assignedTickets);
      }
    };

    fetchAssignedTickets();
  }, []);

  // Function to update the ticket in Supabase (without sending email directly)
  const handleCloseTicket = async (ticket) => {
    // Retrieve current employee details
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const userId = user.id;

    // Update the ticket to set status as "closed" and record the user.id in closed_by
    const { error } = await supabase
      .from("tickets")
      .update({ status: "closed", closed_by: userId })
      .eq("id", ticket.id);

    if (error) {
      console.error("Error closing ticket:", error.message);
      alert("Error closing ticket: " + error.message);
      return;
    } else {
      // Update the local state
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "closed", closed_by: userId } : t
        )
      );
      alert("Ticket closed successfully");
    }
  };

  // Called when user confirms closing the ticket in the modal
  const handleConfirmClose = async () => {
    if (ticketToClose) {
      await handleCloseTicket(ticketToClose);
      setShowModal(false);
      setTicketToClose(null);
    }
  };

  // Effect to monitor tickets and send closure email when a ticket changes to "closed"
  useEffect(() => {
    tickets.forEach(async (ticket) => {
      // Check if ticket is closed and hasn't been notified already
      if (
        ticket.status.toLowerCase() === "closed" &&
        !notifiedTicketIdsRef.current.has(ticket.id)
      ) {
        // Debug log to see the full ticket data
        console.log("Full ticket data for closure email:", ticket);
        
        // Make sure all required fields are included in the payload
        const closurePayload = {
          ticket: {
            name: ticket.name,
            email: ticket.email,
            title: ticket.title,
            closed: true, // Explicitly setting the closure flag
          },
        };

        console.log("Sending closure email payload:", closurePayload);

        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(closurePayload),
          });
          
          if (!response.ok) {
            const result = await response.json();
            console.error("Email sending failed:", result.error);
          } else {
            const result = await response.json();
            console.log("Closure email sent successfully for ticket", ticket.id, result);
            // Add to notified set only after successful email
            notifiedTicketIdsRef.current.add(ticket.id);
          }
        } catch (emailError) {
          console.error("Error calling email endpoint:", emailError);
        }
      }
    });
  }, [tickets]);

  // Filter tickets based on the search query (by title)
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-20 px-6 min-h-screen flex flex-col text-white">
      <h1 className="text-3xl font-bold text-[#23486A] mb-4">Assigned Tickets</h1>

      {/* Search Bar */}
      <div className="flex items-center w-full max-w-lg bg-[#4C7B8B] text-white rounded-full px-4 py-2 mb-6 shadow-md">
        <FaSearch className="text-[#EFB036]" />
        <input
          type="text"
          placeholder="Search tickets..."
          className="ml-2 flex-1 outline-none bg-transparent text-white placeholder-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tickets Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse shadow-md rounded-xl overflow-hidden">
          <thead className="bg-[#23486A] text-white">
            <tr>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Created Date</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Closed By</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"} text-black`}
              >
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-black ${priorityStyles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-gray-300 text-black rounded-full">
                    {ticket.status}
                  </span>
                </td>
                <td className="p-4">
                  {ticket.status.toLowerCase() === "closed" && ticket.closed_by
                    ? ticket.closed_by
                    : "-"}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                    className="bg-[#EFB036] text-black hover:bg-[#D9A02B] px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                  >
                    <FaEye /> View
                  </button>
                  {ticket.status.trim().toLowerCase() !== "closed" && (
                    <button
                      onClick={() => {
                        setTicketToClose(ticket);
                        setShowModal(true);
                      }}
                      className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                    >
                      Close Ticket
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-black">Are you sure?</h2>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={handleConfirmClose} className="bg-red-500 text-white px-4 py-2 rounded">
                Yes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTicketToClose(null);
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTicketList;