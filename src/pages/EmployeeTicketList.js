import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaSearch, FaFilter, FaTicketAlt } from "react-icons/fa";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

const priorityStyles = {
  High: "bg-[#BCA37F]",
  Medium: "bg-[#113946]",
  Low: "bg-[#EAD7BB]",
  Critical: "bg-[#113946]",
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
    <div className="pt-20 px-6 min-h-screen flex flex-col bg-[#FFF2D8] text-[#113946]">
      {/* Header Section with Summary Card */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center">
            <FaTicketAlt className="text-[#113946] text-3xl mr-3" />
            <h1 className="text-3xl font-bold text-[#113946]">Assigned Tickets</h1>
          </div>
          <div className="mt-3 md:mt-0 bg-[#EAD7BB] px-4 py-2 rounded-lg shadow-md">
            <span className="font-semibold">Total Tickets: </span>
            <span className="font-bold">{tickets.length}</span>
          </div>
        </div>
        
        {/* Ticket Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#113946] text-[#FFF2D8] p-4 rounded-xl shadow-md">
            <p className="text-sm opacity-80">Open Tickets</p>
            <p className="text-2xl font-bold">
              {tickets.filter(t => t.status.toLowerCase() === 'open').length}
            </p>
          </div>
          <div className="bg-[#113946] text-[#BCA37F] p-4 rounded-xl shadow-md">
            <p className="text-sm opacity-80">Answered</p>
            <p className="text-2xl font-bold">
              {tickets.filter(t => t.status.toLowerCase() === 'answered').length}
            </p>
          </div>
          <div className="bg-[#113946] text-[#FFF2D8] p-4 rounded-xl shadow-md">
            <p className="text-sm opacity-80">Requested Closure</p>
            <p className="text-2xl font-bold">
              {tickets.filter(t => t.status.toLowerCase() === 'requested').length}
            </p>
          </div>
          <div className="bg-[#113946] text-[#BCA37F] p-4 rounded-xl shadow-md">
            <p className="text-sm opacity-80">Closed</p>
            <p className="text-2xl font-bold">
              {tickets.filter(t => t.status.toLowerCase() === 'closed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#EAD7BB] p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center bg-[#FFF2D8] rounded-full px-4 py-2 shadow-md flex-1">
            <FaSearch className="text-[#113946]" />
            <input
              type="text"
              placeholder="Search tickets by title..."
              className="ml-2 w-full outline-none bg-transparent text-[#113946] placeholder-[#BCA37F]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-[#FFF2D8] rounded-full px-4 py-2 shadow-md">
            <FaFilter className="text-[#113946] mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#113946] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="answered">Answered</option>
              <option value="closed">Closed</option>
              <option value="requested">Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="w-full overflow-x-auto bg-[#EAD7BB] rounded-xl shadow-md mb-6">
        <table className="w-full text-left border-collapse overflow-hidden">
          <thead className="bg-[#113946] text-[#FFF2D8]">
            <tr>
              <th className="p-4 font-medium rounded-tl-lg">Ticket ID</th>
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Created Date</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Closed By</th>
              <th className="p-4 font-medium rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-[#113946]">
                  No tickets match your current filters
                </td>
              </tr>
            ) : (
              currentTickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className={`${index % 2 === 0 ? "bg-[#FFF2D8]" : "bg-[#EAD7BB]"} text-[#113946] hover:bg-[#BCA37F] hover:bg-opacity-30 transition-colors duration-150`}
                >
                  <td className="p-4 font-medium">{ticket.id}</td>
                  <td className="p-4">{ticket.title}</td>
                  <td className="p-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full ${priorityStyles[ticket.priority]} ${ticket.priority === 'Low' ? 'text-[#113946]' : 'text-[#FFF2D8]'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-[#BCA37F] text-[#113946] rounded-full">
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
                      className="bg-[#113946] text-[#FFF2D8] hover:bg-opacity-80 px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                    >
                      <FaEye /> View
                    </button>
                    {ticket.status.trim().toLowerCase() !== "closed" && 
                    ticket.status.trim().toLowerCase() !== "requested" && (
                      <button
                        onClick={() => handleRequestTicket(ticket)}
                        className="bg-[#BCA37F] text-[#113946] hover:bg-opacity-80 px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                      >
                        Request
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 mb-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-[#113946] text-[#FFF2D8] px-4 py-2 rounded-l-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
          >
            Previous
          </button>
          <span className="px-6 py-2 bg-[#EAD7BB] font-medium">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-[#113946] text-[#FFF2D8] px-4 py-2 rounded-r-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#FFF2D8] p-6 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-[#113946]">Confirm Ticket Closure</h2>
            <p className="mb-6 text-[#113946]">Are you sure you want to close this ticket?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setTicketToClose(null);
                }}
                className="bg-[#EAD7BB] text-[#113946] px-5 py-2 rounded-full hover:bg-opacity-80 transition duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmClose} 
                className="bg-[#113946] text-[#FFF2D8] px-5 py-2 rounded-full hover:bg-opacity-80 transition duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTicketList;