import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiChevronDown, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaTicketAlt } from "react-icons/fa"; // Ticket icon
import { supabase } from "../utils/supabase"; // Import Supabase client
import TicketSubmissionModal from "../components/TicketSubmissionModal";

const TicketList = ({ isSidebarOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionDropdown, setActionDropdown] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch tickets from Supabase for the current user only
  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", currentUser.id); // Filter tickets by the current user's ID

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data);
      }
    };

    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser]);

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
    if (error) {
      console.error("Error deleting ticket:", error);
    } else {
      // Remove the deleted ticket from the state
      setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-wrapper")) {
        setActionDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update the filteredTickets calculation
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesStatus = statusFilter === "All" || ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "All" || ticket.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const indexOfLastTicket = currentPage * entriesPerPage;
  const indexOfFirstTicket = indexOfLastTicket - entriesPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  return (
    <div className={`tickets-container transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"}`}>

  <div className="tickets-header flex items-center justify-between">
    <h2 className="flex items-center text-3xl font-extrabold">
      <FaTicketAlt className="mr-2 text-yellow-500 l" /> My Tickets
    </h2>
    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
      <FiPlus className="mr-1" /> New Ticket
    </button>
  </div>
      <div className="tickets-header flex items-center justify-between">
        <h2 className="flex items-center text-3xl font-extrabold">
          <FaTicketAlt className="mr-2 text-yellow-500 l" /> Support Tickets
        </h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
          <FiPlus className="mr-1" /> New Ticket
        </button>
      </div>

      <div className="tickets-controls">
        <div className="filter-group">
          <label>Show:</label>
          <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
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
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td className="text-left">
                  <Link to={`/ticket/${ticket.id}`} className="ticket-link">
                    {ticket.title}
                  </Link>
                </td>
                <td>{ticket.status}</td>
                <td className="priority-cell">
                  <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="action-cell">
                  <button
                    onClick={() => setActionDropdown(ticket.id === actionDropdown ? null : ticket.id)}
                    className="action-btn"
                  >
                    Actions <FiChevronDown />
                  </button>

                  {actionDropdown === ticket.id && (
                    <div className="dropdown-wrapper" ref={dropdownRef}>
                      <div className="dropdown">
                        <Link
                          to={`/ticket/${ticket.id}`}
                          className="dropdown-item"
                          onClick={() => setActionDropdown(null)}
                        >
                          <FiEye /> View
                        </Link>
                        <Link to={`/ticket/edit/${ticket.id}`} className="dropdown-item">
                          <FiEdit /> Edit
                        </Link>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          <FiTrash2 /> Delete
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

      {isModalOpen && <TicketSubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default TicketList;