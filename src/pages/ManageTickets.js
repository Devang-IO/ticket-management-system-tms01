import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiEye, FiTrash2, FiUserMinus } from "react-icons/fi";
import { FaTicketAlt, FaFilter } from "react-icons/fa";
import { supabase } from "../utils/supabase";
import { toast, ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";
import "react-toastify/dist/ReactToastify.css";

const ManageTickets = ({ isSidebarOpen, searchTerm }) => {
  const [tickets, setTickets] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState("5"); // fixed to 5 tickets per page
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  // Instead of inline dropdown state, we store selected ticket id and its dropdown position.
  const [selectedTicketForActions, setSelectedTicketForActions] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);

  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

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
    setSelectedTicketForActions(null);
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

  // Handle click on Actions button
  const handleActionsClick = (ticketId, event) => {
    // Get the bounding rect of the clicked button.
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.top + rect.height + 4, // 4px spacing
      left: rect.left,
    });
    setSelectedTicketForActions(ticketId);
  };

  // Close dropdown if clicking outside the dropdown portal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownPosition) {
        // If dropdown is open and click is outside, close it.
        setSelectedTicketForActions(null);
        setDropdownPosition(null);
      }
    };
    if (selectedTicketForActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedTicketForActions, dropdownPosition]);

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

  // Calculate pagination - always show 5 tickets per page
  const entriesCount = Number(entriesPerPage);
  const totalPages = Math.ceil(filteredTickets.length / entriesCount);
  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * entriesCount,
    currentPage * entriesCount
  );

  // Handle page change
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render the dropdown portal if a ticket is selected for actions.
  const actionsDropdown =
    selectedTicketForActions && dropdownPosition
      ? createPortal(
          <div
            className="dropdown-portal bg-white p-4 rounded shadow-lg transition-all duration-200"
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 1000,
              minWidth: "180px",
            }}
          >
            <Link
              to={`/ticket/${selectedTicketForActions}`}
              className="text-blue-600 hover:underline block mb-2"
              onClick={() => {
                setSelectedTicketForActions(null);
                setDropdownPosition(null);
              }}
            >
              <FiEye className="inline mr-1" /> View Ticket
            </Link>
            {/*
            <button
              className="text-red-600 hover:underline block text-left mb-2"
              onClick={() => {
                openDeleteModal(selectedTicketForActions);
                setSelectedTicketForActions(null);
                setDropdownPosition(null);
              }}
            >
              <FiTrash2 className="inline mr-1" /> Delete Ticket
            </button>
            */}
            <button
              onClick={() => {
                setSelectedTicketForActions(null);
                setDropdownPosition(null);
              }}
              className="mt-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
            >
              Close
            </button>
          </div>,
          document.body
        )
      : null;

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
              onChange={(e) => {
                setEntriesPerPage(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              <option value={5}>5</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: "bold", color: "#23486A" }}>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
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
      <div className="table-container overflow-hidden">
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
                      ticket.priority === "high"
                        ? "bg-[#EFB036]"
                        : ticket.priority === "medium"
                        ? "bg-[#3B6790]"
                        : ticket.priority === "low"
                        ? "bg-[#4C7B8B]"
                        : "bg-[#23486A]"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="p-2" style={{ position: "relative" }}>
                  <button
                    onClick={(e) => handleActionsClick(ticket.id, e)}
                    className="action-btn bg-gray-200 px-2 py-1 rounded inline-flex items-center"
                  >
                    Actions <FiChevronDown className="ml-1" />
                  </button>
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
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-l hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 border-t border-b">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-r hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Render Dropdown via Portal */}
      {selectedTicketForActions && dropdownPosition && createPortal(
        <div
          className="dropdown-portal bg-white p-4 rounded shadow-lg transition-all duration-200"
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 1000,
            minWidth: "180px",
          }}
        >
          <Link
            to={`/ticket/${selectedTicketForActions}`}
            className="text-blue-600 hover:underline block mb-2"
            onClick={() => {
              setSelectedTicketForActions(null);
              setDropdownPosition(null);
            }}
          >
            <FiEye className="inline mr-1" /> View Ticket
          </Link>
          {/*
          <button
            className="text-red-600 hover:underline block text-left mb-2"
            onClick={() => {
              openDeleteModal(selectedTicketForActions);
              setSelectedTicketForActions(null);
              setDropdownPosition(null);
            }}
          >
            <FiTrash2 className="inline mr-1" /> Delete Ticket
          </button>
          */}
          <button
            onClick={() => {
              setSelectedTicketForActions(null);
              setDropdownPosition(null);
            }}
            className="mt-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Close
          </button>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ManageTickets;
