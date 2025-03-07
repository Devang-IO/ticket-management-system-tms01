import React, { useState, useEffect } from "react";
import { FiUserPlus, FiX } from "react-icons/fi";
import Modal from "react-modal";

const AdminTicketList = ({ isSidebarOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const mockTickets = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Issue ${i + 1}`,
      createdBy: ["Alice", "Bob", "Charlie", "David"][i % 4],  // Check if this is correct
      priority: ["High", "Medium", "Low"][i % 3],
      date: `2025-02-${24 - i}`,
    }));
    
    console.log("Mock Tickets:", mockTickets);  // Debugging
    setTickets(mockTickets);
  }, []);
  

  const employees = ["Alice Johnson", "Bob Smith", "Charlie Brown", "David White"];

  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"} p-6 bg-gray-100 min-h-screen mt-16 rounded-2xl`}>
      <div className="flex justify-between items-center mb-6 p-4 bg-white shadow-md rounded-2xl">
        <h2 className="text-2xl font-semibold text-[#23486A]">Admin Ticket List</h2>
      </div>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-[#23486A] text-white">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Created By</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">Created At</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b hover:bg-gray-100">
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{ticket.createdBy}</td>
                <td className="p-4">{ticket.priority}</td>
                <td className="p-4">{ticket.date}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-[#3B6790] text-white rounded-xl hover:bg-[#23486A] flex items-center gap-2 shadow-md"
                  >
                    Assign <FiUserPlus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg w-[30rem]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-center w-full">Assign Employee</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-800">
              <FiX size={24} />
            </button>
          </div>
          <ul>
            {employees.map((employee, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b last:border-none">
                <span className="text-gray-800">{employee}</span>
                <button className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">Assign</button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTicketList;