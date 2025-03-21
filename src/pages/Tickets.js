import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiChevronDown,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import { FaTicketAlt, FaCommentDots } from "react-icons/fa"; // Added comment icon
import { supabase } from "../utils/supabase"; // Import Supabase client
import TicketSubmissionModal from "../components/TicketSubmissionModal";
import { createPortal } from "react-dom";

const TicketList = ({ isSidebarOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionDropdown, setActionDropdown] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeWaitingTickets, setEmployeeWaitingTickets] = useState([]); // Track tickets with waiting employees

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        // Check for any tickets with employee_waiting flag
        const waitingTicketIds = data
          .filter(ticket => ticket.employee_waiting)
          .map(ticket => ticket.id);
        
        setEmployeeWaitingTickets(waitingTicketIds);
        setTickets(data);
      }
    };

    if (currentUser) {
      fetchTickets();

      // Set up real-time subscription for ticket updates
      const subscription = supabase
        .channel('public:tickets')
        .on('UPDATE', (payload) => {
          // Update tickets list with the updated ticket
          setTickets(prev => 
            prev.map(ticket => 
              ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
            )
          );
          
          // Handle employee waiting status
          if (payload.new.employee_waiting && !payload.old.employee_waiting) {
            // Add to highlighted tickets if not already there
            setEmployeeWaitingTickets(prev => 
              prev.includes(payload.new.id) ? prev : [...prev, payload.new.id]
            );
            
            // Play notification sound (optional)
            try {
              const audio = new Audio('/notification-sound.mp3'); // Add this file to your public folder
              audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (error) {
              console.log('Audio initialization failed:', error);
            }
          } else if (!payload.new.employee_waiting && payload.old.employee_waiting) {
            // Remove from highlighted tickets
            setEmployeeWaitingTickets(prev => prev.filter(id => id !== payload.new.id));
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
    if (error) {
      console.error("Error deleting ticket:", error);
    } else {
      // Remove the deleted ticket from the state
      setTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket.id !== ticketId)
      );
    }
  };

  // Handle action button click
  const handleActionClick = (ticketId, event) => {
    // If already open for this ticket, close it
    if (actionDropdown === ticketId) {
      setActionDropdown(null);
      return;
    }
    // Compute the button's bounding rectangle
    const rect = event.currentTarget.getBoundingClientRect();
    // Set the dropdown style with fixed positioning relative to viewport
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4, // a little below the button
      left: rect.left,
      zIndex: 9999,
    });
    setActionDropdown(ticketId);
  };

  // Handle joining chat and clear the waiting status
  const handleJoinChat = async (ticketId) => {
    // Update the ticket to acknowledge the connection
    const { error } = await supabase
      .from("tickets")
      .update({ 
        employee_waiting: false,
        chat_initiated: true,
        user_connected: true
      })
      .eq("id", ticketId);

    if (error) {
      console.error("Error updating ticket:", error);
    } else {
      // Remove from highlighted tickets
      setEmployeeWaitingTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  // Close dropdown when clicking outside (since the portal is rendered in body)
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

  // Update the filteredTickets calculation to use searchQuery
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      ticket.id.toString().includes(searchQuery) ||
      ticket.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.employee_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === "All" ||
      ticket.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort tickets so that tickets with support available (employee_waiting true) are on top.
  // Then sort the rest by status order: "Answered" first, then "Open", then "Closed"
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.employee_waiting && !b.employee_waiting) return -1;
    if (!a.employee_waiting && b.employee_waiting) return 1;

    const statusOrder = {
      "Answered": 1,
      "Open": 2,
      "Closed": 3
    };

    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;

    return orderA - orderB;
  });

  // Pagination logic
  const indexOfLastTicket = currentPage * entriesPerPage;
  const indexOfFirstTicket = indexOfLastTicket - entriesPerPage;
  // Fixed pagination to handle "All" option
  const currentTickets = entriesPerPage === "All" 
    ? sortedTickets 
    : sortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Render the dropdown using a portal so that it isn't clipped by table overflow
  const renderDropdown = (ticketId) => {
    if (actionDropdown !== ticketId) return null;
    return createPortal(
      <div className="dropdown-wrapper" style={dropdownStyle}>
        <div className="dropdown bg-white shadow rounded p-2">
          <Link
            to={`/ticket/${ticketId}`}
            className="dropdown-item flex items-center gap-1 p-1 hover:bg-gray-200"
            onClick={() => setActionDropdown(null)}
          >
            <FiEye /> View
          </Link>
          <button
            className="delete-btn flex items-center gap-1 p-1 hover:bg-gray-200"
            onClick={() => {
              handleDeleteTicket(ticketId);
              setActionDropdown(null);
            }}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div
      className={`tickets-container transition-all duration-300 ${
        isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"
      }`}
    >
      <div className="tickets-header flex items-center justify-between">
        <h2 className="flex items-center text-3xl font-extrabold">
          <FaTicketAlt className="mr-2 text-yellow-500" /> My Tickets
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-1" /> New Ticket
        </button>
      </div>

      <div className="tickets-controls flex flex-wrap items-center gap-4 mt-4">
        <div className="filter-group flex items-center gap-1">
          <label>Show:</label>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              const value = e.target.value;
              setEntriesPerPage(value === "All" ? "All" : Number(value));
            }}
          >
            <option value="All">All</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="filter-group flex items-center gap-1">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
            <option value="Answered">Answered</option>
          </select>
        </div>
        <div className="filter-group flex items-center gap-1">
          <label>Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
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
          className="search-input border rounded p-1"
        />
      </div>

      <div className="table-container mt-4 overflow-x-auto">
        <table className="min-w-full">
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
            {currentTickets.map((ticket) => {
              const isEmployeeWaiting = employeeWaitingTickets.includes(ticket.id);
              
              return (
                <tr 
                  key={ticket.id} 
                  className={`border-t ${isEmployeeWaiting ? 'animate-pulse' : ''}`}
                  style={isEmployeeWaiting ? { 
                    backgroundColor: '#FFE0B2',  // Light orange background
                    boxShadow: '0 0 8px #FF9800', // Orange glow
                    transition: 'background-color 0.5s, box-shadow 0.5s' 
                  } : {}}
                >
                  <td>{ticket.id}</td>
                  <td className="text-left">
                    <div className="flex items-center">
                      <Link to={`/ticket/${ticket.id}`} className="ticket-link">
                        {ticket.title}
                      </Link>
                      {isEmployeeWaiting && (
                        <span className="ml-2 inline-block px-2 py-1 bg-orange-500 text-white text-sm rounded-full animate-bounce">
                          Support available!
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{ticket.status}</td>
                  <td className="priority-cell">
                    <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="relative">
                    {isEmployeeWaiting ? (
                      <Link
                        to={`/ticket/${ticket.id}`}
                        onClick={() => handleJoinChat(ticket.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2"
                      >
                        <FaCommentDots /> Join Chat
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => handleActionClick(ticket.id, e)}
                        className="action-btn flex items-center gap-1"
                      >
                        Actions <FiChevronDown />
                      </button>
                    )}
                    {renderDropdown(ticket.id)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TicketSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TicketList;
