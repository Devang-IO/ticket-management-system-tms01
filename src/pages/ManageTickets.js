import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiEye, FiTrash2, FiUserMinus } from "react-icons/fi";
import { FaTicketAlt, FaFilter } from "react-icons/fa";
import { supabase } from "../utils/supabase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageTickets = ({ isSidebarOpen, searchTerm }) => {
  const [tickets, setTickets] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState("10"); // default to "10"; can be "All"
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [actionDropdown, setActionDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

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

  // Open delete modal for confirmation
  const openDeleteModal = (ticketId) => {
    setTicketToDelete(ticketId);
    setShowDeleteModal(true);
    setActionDropdown(null);
  };

  // Confirm deletion and show toast notification
  const confirmDeleteTicket = async () => {
    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", ticketToDelete);
    if (error) {
      console.error("Error deleting ticket:", error);
    } else {
      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== ticketToDelete)
      );
      toast.success("Ticket deleted successfully");
    }
    setShowDeleteModal(false);
    setTicketToDelete(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTicketToDelete(null);
  };

  // Handle outside click for action dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-wrapper")) {
        setActionDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tickets
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

  // Determine current tickets to display
  const currentTickets =
    entriesPerPage === "All"
      ? filteredTickets
      : filteredTickets.slice(0, Number(entriesPerPage));

  return (
    <div
      className={`tickets-container transition-all duration-300 ${
        isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"
      }`}
    >
      {/* Header */}
      <div className="tickets-header flex items-center justify-between">
        <h2 className="flex items-center text-3xl font-extrabold">
          <FaTicketAlt className="mr-2 text-yellow-500" /> Manage Tickets
        </h2>
      </div>

      {/* Filters Section */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "16px" }}>
          {/* Show Entries Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "bold", color: "#23486A" }}>Show:</label>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(e.target.value)}
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
              <option value="All">All</option>
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
      <div className="table-container">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-[#23486A]">
            <tr>
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
              <tr
                key={ticket.id}
                className={
                  ticket.id.toString() === highlightedTicketId ? "bg-yellow-100" : ""
                }
              >
                <td className="p-2">{ticket.id}</td>
                <td className="p-2">
                  <Link
                    to={`/managetickets?ticketId=${ticket.id}`}
                    className="text-blue-600"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="p-2">{ticket.status}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 text-white text-sm rounded-xl ${
                      ticket.priority === "High"
                        ? "bg-[#EFB036]"
                        : ticket.priority === "Medium"
                        ? "bg-[#3B6790]"
                        : "bg-[#23486A]"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 relative">
                  <button
                    onClick={() =>
                      setActionDropdown(ticket.id === actionDropdown ? null : ticket.id)
                    }
                    className="action-btn bg-gray-200 px-2 py-1 rounded inline-flex items-center"
                  >
                    Actions <FiChevronDown className="ml-1" />
                  </button>
                  {actionDropdown === ticket.id && (
                    <div
                      className="dropdown-wrapper"
                      ref={dropdownRef}
                      style={{
                        position: "absolute",
                        top: "70%",
                        right: 50,
                        zIndex: 1000,
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                        borderRadius: "4px",
                        marginTop: "4px",
                      }}
                    >
                      <div className="dropdown p-2">
                        <Link
                          to={`/ticket/${ticket.id}`}
                          className="dropdown-item block text-blue-600 mb-1"
                        >
                          <FiEye className="inline mr-1" /> View
                        </Link>
                        {/* <button
                          className="dropdown-item block text-red-600 w-full text-left"
                          onClick={() => openDeleteModal(ticket.id)}
                        >
                          <FiTrash2 className="inline mr-1" /> Delete
                        </button> */}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white p-6 rounded shadow-lg max-w-sm mx-auto">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete this ticket?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTicket}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container (if not already added in a higher-level component) */}
      <ToastContainer />
    </div>
  );
};

export default ManageTickets;
