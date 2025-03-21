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

  // Sorting and filtering:
  const sortedFilteredTickets = [...tickets]
    .filter((ticket) => filter === "All" || ticket.priority === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        // Ascending order (oldest first) to match the "⬆️" indicator
        return (
          new Date(a.closedDate || a.created_at) -
          new Date(b.closedDate || b.created_at)
        );
      }
      if (sortBy === "priority") {
        // Define numeric values for priority so that higher priority appears first.
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  return (
    <div className="w-full min-h-screen bg-[#EEF3F7] px-4 py-6 md:pl-20 md:py-6">
      {/* Header Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full mt-16 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#23486A] text-left">
          📁 Closed Tickets
        </h1>

        {/* Sorting & Filtering Options */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 mt-4 shadow-lg rounded-xl">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-semibold">Sort by:</label>
            <select
              className="px-4 py-2 border rounded-md shadow bg-[#3B6790] text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date Closed ⬆️</option>
              <option value="priority">Priority 🔽</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-semibold">Priority:</label>
            <select
              className="px-4 py-2 border rounded-md shadow bg-[#3B6790] text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="w-full max-w-7xl mx-auto mt-6 rounded-xl shadow-lg">
        {loading ? (
          <p className="text-gray-500 text-center p-6">Loading tickets...</p>
        ) : sortedFilteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#3B6790] text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Date Closed</th>
                  <th className="p-3 text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="bg-white">
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
                    <td className="p-3 text-center">
                      <span
                        className={`px-4 py-1 rounded-full text-white font-semibold text-sm inline-flex items-center justify-center shadow-md ${
                          ticket.priority === "high"
                            ? "bg-[#EFB036]"
                            : ticket.priority === "medium"
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
          </div>
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
