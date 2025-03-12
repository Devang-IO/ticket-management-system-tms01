import React, { useState } from "react";

const ClosedTickets = () => {
  // Sample data for closed tickets (original state remains unchanged)
  const originalTickets = [
    { id: 1, title: "Login issue", priority: "High", closedDate: "2025-03-01" },
    { id: 2, title: "Dashboard bug", priority: "Medium", closedDate: "2025-02-28" },
    { id: 3, title: "Navbar UI glitch", priority: "Low", closedDate: "2025-02-25" },
    { id: 4, title: "API not responding", priority: "High", closedDate: "2025-02-27" },
    { id: 5, title: "Form validation error", priority: "Medium", closedDate: "2025-02-20" },
    { id: 6, title: "Footer links broken", priority: "Low", closedDate: "2025-02-22" },
    { id: 7, title: "Data loss in reports", priority: "High", closedDate: "2025-02-18" },
    { id: 8, title: "Slow page load", priority: "Medium", closedDate: "2025-02-26" },
    { id: 9, title: "Search function not working", priority: "Low", closedDate: "2025-02-23" },
    { id: 10, title: "Email notifications failing", priority: "High", closedDate: "2025-02-15" },
    { id: 11, title: "Pagination issue", priority: "Medium", closedDate: "2025-02-14" },
    { id: 12, title: "Modal popup stuck", priority: "Low", closedDate: "2025-02-10" },
    { id: 13, title: "Session timeout issue", priority: "High", closedDate: "2025-02-12" },
    { id: 14, title: "Dark mode not applying", priority: "Medium", closedDate: "2025-02-08" },
    { id: 15, title: "Button hover effect missing", priority: "Low", closedDate: "2025-02-05" },
  ];

  const [sortBy, setSortBy] = useState("date");
  const [filter, setFilter] = useState("All");

  // Sort and filter dynamically without modifying the original list
  const sortedFilteredTickets = [...originalTickets]
    .filter(ticket => filter === "All" || ticket.priority === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.closedDate) - new Date(a.closedDate);
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
        <h1 className="text-3xl font-bold text-[#23486A] text-left w-full md:w-auto"> 📁 Closed Tickets</h1>
       
        {/* Sorting & Filtering Options */}
        <div className="flex items-center gap-4 p-4 mt-4 shadow-lg rounded-xl ">
           {/* Sort By Dropdown */}
        <label className="text-gray-700 font-semibold">Sort by:</label>
        <select
          className="px-4 py-2 border rounded-md shadow bg-[#3B6790] text-white "
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

      {/* Tickets List */}
   {/* Tickets Table */}
   <div className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
        {sortedFilteredTickets.length > 0 ? (
            <table className="w-full border-collapse shadow-md ">
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
                        <tr key={ticket.id} className="border-b hover:bg-gray-100 transition duration-200">
                            <td className="p-3 text-[#23486A]">{index + 1}</td>
                            <td className="p-3 text-[#3B6790] font-medium">{ticket.title}</td>
                            <td className="p-3 text-[#23486A]">{ticket.closedDate}</td>
                            <td className="p-3 text-center align-middle">
                                <span
                                    className={`px-4 py-1 rounded-full text-white font-semibold text-sm w-24 inline-flex items-center justify-center shadow-md ${
                                        ticket.priority === "High" ? "bg-[#EFB036]" :
                                        ticket.priority === "Medium" ? "bg-[#3B6790]" : "bg-[#4C7B8B]"
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
    <p className="text-gray-500 text-center">No closed tickets found.</p>
  )}
</div>

    </div>
  );
};

export default ClosedTickets;
