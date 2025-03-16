import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiEye, FiTrash2, FiUserMinus } from "react-icons/fi";
import { FaTicketAlt, FaFilter } from "react-icons/fa";
import { supabase } from "../utils/supabase";

const ManageTickets = ({ isSidebarOpen, searchTerm }) => {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [actionDropdown, setActionDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Read the query parameter to get a highlighted ticket id.
  const [searchParams] = useSearchParams();
  const highlightedTicketId = searchParams.get("ticketId");

  // Fetch all tickets for Admin
  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data);
      }
    };

    fetchTickets();
  }, []);

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
    if (error) {
      console.error("Error deleting ticket:", error);
    } else {
      setTickets((prevTickets) => prevTickets.filter(ticket => ticket.id !== ticketId));
      setActionDropdown(null);
    }
  };

  // Handle unassigning ticket: update ticket status to "open"
  const handleUnassignTicket = async (ticketId) => {
    const { error } = await supabase
      .from("tickets")
      .update({ status: "open" })
      .eq("id", ticketId);

    if (error) {
      console.error("Error unassigning ticket:", error);
    } else {
      setTickets((prevTickets) =>
        prevTickets.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: "open" } : ticket
        )
      );
      setActionDropdown(null);
    }
  };

  // Handle outside click for action dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-wrapper")) {
        setActionDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm
      ? ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(searchTerm) ||
        ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter === "All" || ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "All" || ticket.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination logic
  const indexOfLastTicket = currentPage * entriesPerPage;
  const indexOfFirstTicket = indexOfLastTicket - entriesPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);

  return (
    <div className={`tickets-container transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"}`}>
      {/* Header */}
      <div className="tickets-header flex items-center justify-between">
        <h2 className="flex items-center text-3xl font-extrabold">
          <FaTicketAlt className="mr-2 text-yellow-500" /> Manage Tickets
        </h2>
      </div>

      {/* Filters Section Container */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "16px",
          }}
        >
          {/* Show Entries Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "bold", color: "#23486A" }}>Show:</label>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "bold", color: "#23486A" }}>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "bold", color: "#23486A" }}>Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ overflow: "visible" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={ticket.id.toString() === highlightedTicketId ? "bg-yellow-100" : ""}
              >
                <td>{ticket.id}</td>
                <td className="text-left">
                  <Link to={`/managetickets?ticketId=${ticket.id}`} className="ticket-link">
                    {ticket.title}
                  </Link>
                </td>
                <td>{ticket.status}</td>
                <td>
                  <span className={`px-3 py-1 text-white text-sm rounded-xl ${
                    ticket.priority === "High" ? "bg-[#EFB036]" :
                    ticket.priority === "Medium" ? "bg-[#3B6790]" :
                    "bg-[#23486A]"
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="action-cell" style={{ position: "relative" }}>
                  <button
                    onClick={() => setActionDropdown(ticket.id === actionDropdown ? null : ticket.id)}
                    className="action-btn"
                  >
                    Actions <FiChevronDown />
                  </button>

                  {actionDropdown === ticket.id && (
                    <div 
                      className="dropdown-wrapper" 
                      ref={dropdownRef}
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                        borderRadius: "4px",
                        marginTop: "4px",
                      }}
                    >
                      <div className="dropdown">
                        <Link to={`/ticket/${ticket.id}`} className="dropdown-item">
                          <FiEye className="mr-1" /> View
                        </Link>
                        <button className="dropdown-item" onClick={() => handleUnassignTicket(ticket.id)}>
                          <FiUserMinus className="mr-1" /> Unassign
                        </button>
                        <button className="dropdown-item text-red-600" onClick={() => handleDeleteTicket(ticket.id)}>
                          <FiTrash2 className="mr-1 text-red-600" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ManageTickets;
