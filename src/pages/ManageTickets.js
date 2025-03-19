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

  const [searchParams] = useSearchParams();
  const highlightedTicketId = searchParams.get("ticketId");

  // Fetch tickets
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

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
    if (error) {
      console.error("Error deleting ticket:", error);
    } else {
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
      setActionDropdown(null);
    }
  };

  const handleUnassignTicket = async (ticketId) => {
    const { error } = await supabase
      .from("tickets")
      .update({ status: "open" })
      .eq("id", ticketId);
    if (error) {
      console.error("Error unassigning ticket:", error);
    } else {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: "open" } : ticket
        )
      );
      setActionDropdown(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-wrapper")) {
        setActionDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = searchTerm
      ? ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(searchTerm) ||
        ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "All" ||
      ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === "All" ||
      ticket.priority.toLowerCase() === priorityFilter.toLowerCase();
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

      {/* Filters Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex gap-4">
          {/* Entries Filter */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#23486A]">Show:</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing entries
              }}
              className="p-1 border border-gray-300 rounded bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#23486A]">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1 border border-gray-300 rounded bg-white"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#23486A]">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1 border border-gray-300 rounded bg-white"
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-[#23486A]">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Created At</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket) => (
              <tr key={ticket.id} className={ticket.id.toString() === highlightedTicketId ? "bg-yellow-100" : ""}>
                <td className="p-2">{ticket.id}</td>
                <td className="p-2">
                  <Link to={`/managetickets?ticketId=${ticket.id}`} className="text-blue-600">
                    {ticket.title}
                  </Link>
                </td>
                <td className="p-2">{ticket.status}</td>
                <td className="p-2">
                  <span className={`px-3 py-1 text-white text-sm rounded-xl ${
                    ticket.priority === "High" ? "bg-[#EFB036]" :
                    ticket.priority === "Medium" ? "bg-[#3B6790]" : "bg-[#23486A]"
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-2">{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="p-2 relative">
                  <button
                    onClick={() => setActionDropdown(ticket.id === actionDropdown ? null : ticket.id)}
                    className="bg-gray-200 px-2 py-1 rounded inline-flex items-center"
                  >
                    Actions <FiChevronDown className="ml-1" />
                  </button>
                  {actionDropdown === ticket.id && (
                    <div ref={dropdownRef} className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10">
                      <div className="p-2">
                        <Link to={`/ticket/${ticket.id}`} className="block text-blue-600 mb-1">
                          <FiEye className="inline mr-1" /> View
                        </Link>
                        {/* Uncomment if needed
                        <button onClick={() => handleUnassignTicket(ticket.id)} className="block text-gray-600 mb-1 w-full text-left">
                          <FiUserMinus className="inline mr-1" /> Unassign
                        </button>
                        */}
                        <button onClick={() => handleDeleteTicket(ticket.id)} className="block text-red-600 w-full text-left">
                          <FiTrash2 className="inline mr-1" /> Delete
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
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageTickets;
