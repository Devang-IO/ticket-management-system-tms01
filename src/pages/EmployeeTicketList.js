import React, { useState, useEffect } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import { supabase } from "../utils/supabase"; // Import your initialized Supabase client
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch assignments joined with the related ticket data (including closed_by)
      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, closed_by)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        const assignedTickets = data.map(assignment => assignment.ticket);
        setTickets(assignedTickets);
      }
    };

    fetchAssignedTickets();
  }, []);

  // Function to handle closing a ticket (updates status and closed_by)
  const handleCloseTicket = async (ticket) => {
    const confirmed = window.confirm("Are you sure you want to close this ticket?");
    if (!confirmed) return;

    // Retrieve current employee details
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }

    // Update the ticket to set status as "closed" and record who closed it
    const { data, error } = await supabase
      .from("tickets")
      .update({ status: "closed", closed_by: user.id })
      .eq("id", ticket.id);

    if (error) {
      console.error("Error closing ticket:", error);
      alert("Error closing ticket");
    } else {
      setTickets((prevTickets) =>
        prevTickets.map(t =>
          t.id === ticket.id ? { ...t, status: "closed", closed_by: user.id } : t
        )
      );
      alert("Ticket closed successfully");
    }
  };

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
              <tr key={ticket.id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"} text-black`}>
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
                  {ticket.status === "closed" && ticket.closed_by ? ticket.closed_by : "-"}
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                    className="bg-[#EFB036] text-black hover:bg-[#D9A02B] px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200"
                  >
                    <FaEye /> View
                  </button>
                  {ticket.status === "open" && (
                    <button
                      onClick={() => handleCloseTicket(ticket)}
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
    </div>
  );
};

export default EmployeeTicketList;
