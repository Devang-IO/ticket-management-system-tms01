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
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5; // Change as needed
  const [showModal, setShowModal] = useState(false);
  const [ticketToClose, setTicketToClose] = useState(null);
  const navigate = useNavigate();

  // Ref to track which tickets have already triggered an email
  const notifiedTicketIdsRef = useRef(new Set());

  // Function to fetch user name by ID from the 'users' table
  const fetchUserNameById = async (userId) => {
    const { data, error } = await supabase
      .from("users") // Fetch from the 'users' table
      .select("name")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user name:", error);
      return "Unknown";
    }
    return data?.name || "Unknown";
  };

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch assignments joined with the related ticket data (including closed_by, name, email, and user_id)
      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, closed_by, user_id, name, email)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        // Map assignments to extract the ticket object
        const assignedTickets = data.map((assignment) => assignment.ticket);
        
        // For tickets that are closed, fetch the name of the ticket creator (from ticket.user_id)
        const ticketsWithNames = await Promise.all(
          assignedTickets.map(async (ticket) => {
            if (ticket.status.toLowerCase() === "closed") {
              const creatorName = await fetchUserNameById(ticket.user_id);
              return { ...ticket, closed_by_name: creatorName };
            }
            return ticket;
          })
        );

        // Sort the tickets so that the latest tickets appear first
        const sortedTickets = ticketsWithNames.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setTickets(sortedTickets);
      }
    };

    fetchAssignedTickets();
  }, []);

  // Combined filtering: search by title and by status filter
  const filteredTickets = tickets.filter((ticket) => {
    const searchMatch = ticket.title.toLowerCase().includes(search.toLowerCase());
    const status = ticket.status.trim().toLowerCase();
    const statusMatch = statusFilter === "all" || status === statusFilter;
    return searchMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Reset pagination if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Function to handle requesting ticket closure (resolution notes removed)
  const handleRequestTicket = async (ticket) => {
    // Get the current employee's details
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const userId = user.id;

    // Update the ticket to set status as "requested" without resolution notes
    const { error } = await supabase
      .from("tickets")
      .update({ 
        status: "requested", 
        closed_by: userId
      })
      .eq("id", ticket.id);

    if (error) {
      console.error("Error requesting ticket closure:", error.message);
      alert("Error requesting ticket closure: " + error.message);
      return;
    } else {
      // Update the local state
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === ticket.id
            ? { ...t, status: "requested", closed_by: userId }
            : t
        )
      );
      alert("Ticket closure request sent successfully");
    }
  };

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

    // We want to show the name of the user who created the ticket,
    // so we fetch the name based on ticket.user_id rather than the current user
    const { error } = await supabase
      .from("tickets")
      .update({ status: "closed", closed_by: user.id })
      .eq("id", ticket.id);

    if (error) {
      console.error("Error closing ticket:", error.message);
      alert("Error closing ticket: " + error.message);
      return;
    } else {
      // Fetch the creator's name using ticket.user_id
      const creatorName = await fetchUserNameById(ticket.user_id);
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === ticket.id
            ? { ...t, status: "closed", closed_by: t.user_id, closed_by_name: creatorName }
            : t
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
        console.log("Full ticket data for closure email:", ticket);
        
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
            notifiedTicketIdsRef.current.add(ticket.id);
          }
        } catch (emailError) {
          console.error("Error calling email endpoint:", emailError);
        }
      }
    });
  }, [tickets]);

  return (
    <div className="pt-20 px-6 min-h-screen flex flex-col text-white">
      <h1 className="text-3xl font-bold text-[#23486A] mb-4">Assigned Tickets</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center bg-[#4C7B8B] rounded-full px-4 py-2 shadow-md">
          <FaSearch className="text-[#EFB036]" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="ml-2 flex-1 outline-none bg-transparent text-white placeholder-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#4C7B8B] text-white p-2 rounded shadow-md outline-none"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
            <option value="requested">Requested</option>
          </select>
        </div>
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
            {currentTickets.map((ticket, index) => (
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
                  {ticket.status.toLowerCase() === "closed" && ticket.closed_by_name
                    ? ticket.closed_by_name
                    : "-"}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                    className="bg-[#EFB036] text-black hover:bg-[#D9A02B] px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                  >
                    <FaEye /> View
                  </button>
                  {ticket.status.trim().toLowerCase() !== "closed" && 
                   ticket.status.trim().toLowerCase() !== "requested" && (
                    <button
                      onClick={() => handleRequestTicket(ticket)}
                      className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                    >
                      Request
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 text-black px-4 py-2 rounded-l disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-300 text-black px-4 py-2 rounded-r disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

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
