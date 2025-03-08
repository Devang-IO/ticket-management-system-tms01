import React, { useState, useEffect } from "react";
import { FiUserPlus, FiX, FiSearch } from "react-icons/fi";
import Modal from "react-modal";

const AdminTicketList = ({ isSidebarOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const mockTickets = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      createdBy: ["Alice", "Bob", "Charlie", "David"][i % 4],
      priority: ["High", "Medium", "Low"][i % 3],
      date: `2025-02-${String(24 - i).padStart(2, "0")}`,
    }));
    setTickets(mockTickets);
  }, []);

  const employees = [
    { name: "Alice Johnson", role: "Software Engineer", department: "IT" },
    { name: "Bob Smith", role: "Network Admin", department: "IT" },
    { name: "Charlie Brown", role: "Customer Support", department: "Helpdesk" },
    { name: "David White", role: "QA Analyst", department: "Quality" },
    { name: "John Doe", role: "IT Specialist", department: "IT" },
    { name: "Millie Brown", role: "Support Engineer", department: "Helpdesk" },
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (employee) => {
    setSelectedEmployee(employee);
    setSuccessMessage(`✅ Ticket assigned to ${employee.name} successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div
      className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"
        } p-6 bg-gray-100 min-h-screen mt-16 rounded-2xl`}
    >
      <div className="flex justify-between items-center mb-6 p-4 bg-white shadow-md rounded-2xl">
        <h2 className="text-2xl font-semibold text-[#23486A]">Assign Tickets</h2>
      </div>
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#23486A] text-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Created By</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{ticket.createdBy}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-white text-sm rounded-xl ${ticket.priority === "High" ? "bg-[#EFB036]"
                      : ticket.priority === "Medium" ? "bg-[#3B6790]"
                        : ticket.priority === "Low" ? "bg-[#23486A]"
                          : "bg-[#4C7B8B]"
                    }`}>
                    {ticket.priority}
                  </span>
                </td>

                <td className="p-4">{ticket.date}</td>
                <td className="p-4 text-center align-middle">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-white rounded-xl flex items-center gap-2 shadow-md bg-gradient-to-r from-[#3B6790] to-[#23486A] hover:from-[#23486A] hover:to-[#3B6790]"
                  >
                    Assign <FiUserPlus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg w-[40rem] max-h-[80vh] overflow-y-auto">
          {/* Success Message at the top of Modal */}
          {successMessage && (
            <div className="p-2 mb-3 bg-green-100 text-green-800 rounded-xl text-center">{successMessage}</div>
          )}

          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-center w-full">Assign Employee</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800">
              <FiX size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Employee List with Scroll */}
          <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ul>
              {filteredEmployees.map((employee, index) => (
                <li key={index} className="flex justify-between items-center py-3 border-b last:border-none">
                  <div>
                    <span className="text-gray-800 font-semibold">{employee.name}</span>
                    <p className="text-sm text-gray-500">{employee.role} - {employee.department}</p>
                  </div>
                  <button onClick={() => handleAssign(employee)} className="px-3 py-1 bg-green-500 text-white rounded-xl hover:bg-green-600">
                    Assign
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTicketList;
