import React, { useState } from "react";
import { FaEye, FaSearch } from "react-icons/fa";

const tickets = [
  { id: "T-101", title: "Login Issue", assignedBy: "Admin", createdDate: "2025-03-10", priority: "High", status: "Open" },
  { id: "T-102", title: "Payment Failure", assignedBy: "Admin", createdDate: "2025-03-11", priority: "Critical", status: "In Progress" },
  { id: "T-103", title: "UI Bug in Dashboard", assignedBy: "Admin", createdDate: "2025-03-12", priority: "Medium", status: "Open" },
  { id: "T-101", title: "Login Issue", assignedBy: "Admin", createdDate: "2025-03-10", priority: "High", status: "Open" },
  { id: "T-102", title: "Payment Failure", assignedBy: "Admin", createdDate: "2025-03-11", priority: "Critical", status: "In Progress" },
];

const priorityStyles = {
  High: "bg-[#EFB036]",
  Medium: "bg-[#3B6790]",
  Low: "bg-[#4C7B8B]",
  Critical: "bg-[#23486A]",
};

const EmployeeTicketList = () => {
  const [search, setSearch] = useState("");
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

      {/* Full-Screen Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse shadow-md rounded-xl overflow-hidden">
          <thead className="bg-[#23486A] text-white">
            <tr>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Assigned By</th>
              <th className="p-4">Created Date</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"} text-black`}
              >
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{ticket.assignedBy}</td>
                <td className="p-4">{ticket.createdDate}</td>

                {/* Priority Badge (Simplified) */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${priorityStyles[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="p-4">
                  <span className="px-3 py-1 bg-gray-300 text-black rounded-full">
                    {ticket.status}
                  </span>
                </td>

                {/* View Button */}
                <td className="p-4">
                  <button className="bg-[#EFB036] text-black hover:bg-[#D9A02B] px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition duration-200">
                    <FaEye /> View
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

export default EmployeeTicketList;