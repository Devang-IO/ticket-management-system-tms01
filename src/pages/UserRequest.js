import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const UserRequest = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch assignments with joined ticket data
      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, chat_initiated)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        // Extract the tickets
        const assignedTickets = data.map((assignment) => assignment.ticket);
        setTickets(assignedTickets);
      }
    };

    fetchAssignedTickets();
  }, []);

  // Filter tickets based on search query (by title)
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  // Enable chat in DB and navigate
  const handleConnect = async (ticketId) => {
    const { error } = await supabase
      .from("tickets")
      .update({ chat_initiated: true })
      .eq("id", ticketId);

    if (error) {
      console.error("Error enabling chat:", error);
      return;
    }
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div className="pt-20 px-6 min-h-screen flex flex-col text-white">
      <h1 className="text-3xl font-bold text-[#23486A] mb-4">User Requests</h1>
      {/* Search Bar, Table, etc. */}
      <div className="flex items-center w-full max-w-lg bg-[#4C7B8B] text-white rounded-full px-4 py-2 mb-6 shadow-md">
        {/* Search input here */}
        ...
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse shadow-md rounded-xl overflow-hidden">
          <thead className="bg-[#23486A] text-white">
            <tr>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Created Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="bg-gray-100 text-black">
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handleConnect(ticket.id)}
                    className="bg-[#EFB036] text-black px-4 py-2 rounded-full"
                  >
                    Connect
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRequest;
