import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { supabase } from "../utils/supabase"; // Import your initialized Supabase client

const ClosedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosedTickets = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch closed tickets for the current user
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("status", "closed")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching closed tickets:", error);
      } else {
        setTickets(data);
      }
      setLoading(false);
    };

    fetchClosedTickets();
  }, []);

  // Sort and filter dynamically
  const sortedFilteredTickets = [...tickets]
    .filter((ticket) => filter === "All" || ticket.priority === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        // Use closedDate if available, otherwise fallback to created_at
        return (
          new Date(b.closedDate || b.created_at) -
          new Date(a.closedDate || a.created_at)
        );
      }
      if (sortBy === "priority") {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  return (
    <div className="w-full min-h-screen bg-[#EEF3F7] p-6 pl-20">
      {/* Header Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full mt-16">
        <h1 className="text-3xl font-bold text-[#23486A] text-left w-full md:w-auto">
          📁 Closed Tickets
        </h1>

        {/* Sorting & Filtering Options */}
        <div className="flex items-center gap-4 p-4 mt-4 shadow-lg rounded-xl">
          {/* Sort By Dropdown */}
          <label className="text-gray-700 font-semibold">Sort by:</label>
          <select
            className="px-4 py-2 border rounded-md shadow bg-[#3B6790] text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date Closed ⬆️</option>
            <option value="priority">Priority 🔽</option>
          </select>

          {/* Priority Filter */}
          <label className="text-gray-700 font-semibold">Priority:</label>
          <select
            className="px-4 py-2 border rounded-md shadow bg-[#3B6790] text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="w-full border-collapse rounded-xl overflow-hidden shadow-lg mt-6">
        {loading ? (
          <p className="text-gray-500 text-center p-6">Loading tickets...</p>
        ) : sortedFilteredTickets.length > 0 ? (
          <table className="w-full border-collapse shadow-md">
            <thead className="bg-[#3B6790] text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Date Closed</th>
                <th className="p-3 text-center align-middle">Priority</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredTickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className="border-b hover:bg-gray-100 transition duration-200"
                >
                  <td className="p-3 text-[#23486A]">{index + 1}</td>
                  <td className="p-3 text-[#3B6790] font-medium">
                    {ticket.title}
                  </td>
                  <td className="p-3 text-[#23486A]">
                    {new Date(ticket.closedDate || ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center align-middle">
                    <span
                      className={`px-4 py-1 rounded-full text-white font-semibold text-sm w-24 inline-flex items-center justify-center shadow-md ${
                        ticket.priority === "High"
                          ? "bg-[#EFB036]"
                          : ticket.priority === "Medium"
                          ? "bg-[#3B6790]"
                          : "bg-[#4C7B8B]"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center p-6">
            No closed tickets found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ClosedTickets;
