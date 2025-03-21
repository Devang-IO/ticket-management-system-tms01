import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

/**
 * Returns the pill classes for the Priority column.
 * Pastel background + darker border + text color
 */
const getPriorityPillClass = (priority) => {
  const p = (priority || "").toLowerCase().trim();
  switch (p) {
    case "low":
      // Light teal background, dark teal border
      return "inline-block px-3 py-1 border border-teal-600 bg-teal-50 text-teal-700 rounded-full";
    case "medium":
      // Light blue background, dark blue border
      return "inline-block px-3 py-1 border border-blue-600 bg-blue-50 text-blue-700 rounded-full";
    case "high":
      // Light yellow background, dark yellow border
      return "inline-block px-3 py-1 border border-yellow-600 bg-yellow-50 text-yellow-700 rounded-full";
    case "critical":
      // Light indigo background, dark indigo border
      return "inline-block px-3 py-1 border border-indigo-600 bg-indigo-50 text-indigo-700 rounded-full";
    default:
      // Fallback
      return "inline-block px-3 py-1 border border-gray-600 bg-gray-50 text-gray-700 rounded-full";
  }
};

/**
 * Returns the pill classes for the Status column.
 * Pastel background + darker border + text color
 */
const getStatusPillClass = (status) => {
  const s = (status || "").toLowerCase().trim();
  switch (s) {
    case "open":
      return "inline-block px-3 py-1 border border-yellow-600 bg-yellow-50 text-yellow-700 rounded-full";
    case "answered":
      return "inline-block px-3 py-1 border border-blue-600 bg-blue-50 text-blue-700 rounded-full";
    case "closed":
      return "inline-block px-3 py-1 border border-green-600 bg-green-50 text-green-700 rounded-full";
    case "requested":
      return "inline-block px-3 py-1 border border-red-600 bg-red-50 text-red-700 rounded-full";
    default:
      // Fallback
      return "inline-block px-3 py-1 border border-teal-600 bg-teal-50 text-teal-700 rounded-full";
  }
};

// Main container + styling
const pageContainer = "pt-24 px-6 min-h-screen flex flex-col bg-gray-50 text-gray-800";
const pageTitle = "text-3xl font-bold text-[#23486A] mb-4";
const searchBarClass = "flex items-center w-full max-w-lg bg-white border border-gray-300 text-gray-600 rounded-full px-4 py-2 mb-6 shadow-md";
const tableContainer = "w-full overflow-x-auto";
const tableClass = "w-full text-left border-collapse shadow-md rounded-xl overflow-hidden";
const tableHeaderClass = "bg-blue-50 border-b border-blue-100 text-blue-800";
const tableCellClass = "p-4";
const rowEven = "bg-gray-50";
const rowOdd = "bg-white";

const EmployeeTicketList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [ticketToClose, setTicketToClose] = useState(null);

  // Keep track of which tickets have already triggered closure email
  const notifiedTicketIdsRef = useRef(new Set());

  // Fetch user name from 'users' table
  const fetchUserNameById = async (userId) => {
    const { data, error } = await supabase
      .from("users")
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, closed_by, user_id, name, email)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        const assignedTickets = data.map((assignment) => assignment.ticket);

        // If ticket is closed, fetch the name of the ticket's creator
        const ticketsWithNames = await Promise.all(
          assignedTickets.map(async (ticket) => {
            if ((ticket.status || "").toLowerCase() === "closed") {
              const creatorName = await fetchUserNameById(ticket.user_id);
              return { ...ticket, closed_by_name: creatorName };
            }
            return ticket;
          })
        );

        // Sort tickets by created date descending
        const sortedTickets = ticketsWithNames.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setTickets(sortedTickets);
      }
    };

    fetchAssignedTickets();
  }, []);

  // Filter by search + status
  const filteredTickets = tickets.filter((ticket) => {
    const titleMatch = (ticket.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const status = (ticket.status || "").toLowerCase().trim();
    const statusMatch = statusFilter === "all" || status === statusFilter;
    return titleMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Reset to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Request closure
  const handleRequestTicket = async (ticket) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }
    const userId = user.id;
    const { error } = await supabase
      .from("tickets")
      .update({ status: "requested", closed_by: userId })
      .eq("id", ticket.id);

    if (error) {
      console.error("Error requesting ticket closure:", error.message);
      alert("Error requesting ticket closure: " + error.message);
      return;
    }
    // Update local state
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, status: "requested", closed_by: userId } : t
      )
    );
    alert("Ticket closure request sent successfully");
  };

  // Close ticket
  const handleCloseTicket = async (ticket) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }
    const { error } = await supabase
      .from("tickets")
      .update({ status: "closed", closed_by: user.id })
      .eq("id", ticket.id);

    if (error) {
      console.error("Error closing ticket:", error.message);
      alert("Error closing ticket: " + error.message);
      return;
    }
    // Fetch creator's name
    const creatorName = await fetchUserNameById(ticket.user_id);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? { ...t, status: "closed", closed_by: t.user_id, closed_by_name: creatorName }
          : t
      )
    );
    alert("Ticket closed successfully");
  };

  // Confirm close from modal
  const handleConfirmClose = async () => {
    if (ticketToClose) {
      await handleCloseTicket(ticketToClose);
      setShowModal(false);
      setTicketToClose(null);
    }
  };

  // Watch for closed tickets => send closure email
  useEffect(() => {
    tickets.forEach(async (ticket) => {
      const s = (ticket.status || "").toLowerCase();
      if (s === "closed" && !notifiedTicketIdsRef.current.has(ticket.id)) {
        const closurePayload = {
          ticket: {
            name: ticket.name,
            email: ticket.email,
            title: ticket.title,
            closed: true,
          },
        };
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
    <div className={pageContainer}>
      <h1 className={pageTitle}>Assigned Tickets</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Search bar */}
        <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-md">
          <FaSearch className="text-[#EFB036]" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="ml-2 flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white text-gray-800 p-2 rounded shadow-md outline-none border border-gray-300"
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
      <div className={tableContainer}>
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            <tr>
              <th className={tableCellClass}>Ticket ID</th>
              <th className={tableCellClass}>Title</th>
              <th className={tableCellClass}>Created Date</th>
              <th className={tableCellClass}>Priority</th>
              <th className={tableCellClass}>Status</th>
              <th className={tableCellClass}>Closed By</th>
              <th className={tableCellClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket, index) => {
              const rowStyle = index % 2 === 0 ? rowEven : rowOdd;

              // Priority pill classes
              const priorityPillClass = getPriorityPillClass(ticket.priority);
              // Status pill classes
              const statusPillClass = getStatusPillClass(ticket.status);

              return (
                <tr key={ticket.id} className={rowStyle}>
                  <td className={tableCellClass}>{ticket.id}</td>
                  <td className={tableCellClass}>{ticket.title}</td>
                  <td className={tableCellClass}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>

                  {/* Priority Pill */}
                  <td className={tableCellClass}>
                    <span className={priorityPillClass}>{ticket.priority}</span>
                  </td>

                  {/* Status Pill */}
                  <td className={tableCellClass}>
                    <span className={statusPillClass}>{ticket.status}</span>
                  </td>

                  {/* Closed By */}
                  <td className={tableCellClass}>
                    {ticket.status?.toLowerCase() === "closed" && ticket.closed_by_name
                      ? ticket.closed_by_name
                      : "-"}
                  </td>

                  {/* Actions */}
                  <td className={`${tableCellClass} flex gap-2`}>
                    <button
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-full shadow-md transition duration-200 flex items-center gap-2"
                    >
                      <FaEye /> View
                    </button>

                    {ticket.status?.toLowerCase() !== "closed" &&
                      ticket.status?.toLowerCase() !== "requested" && (
                        <button
                          onClick={() => handleRequestTicket(ticket)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                        >
                          Request
                        </button>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="bg-gray-600 text-white px-4 py-2 rounded-l disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-600 text-white px-4 py-2 rounded-r disabled:opacity-50"
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
              <button
                onClick={handleConfirmClose}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTicketToClose(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded"
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
