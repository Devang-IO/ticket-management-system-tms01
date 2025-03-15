import React, { useState, useEffect } from "react";
import { FiUserPlus, FiX, FiSearch } from "react-icons/fi";
import { FaTicketAlt } from "react-icons/fa";
import Modal from "react-modal";
import { supabase } from "../utils/supabase"; // Import Supabase client

const AdminTicketList = ({ isSidebarOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch tickets from Supabase
  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data);
      }
    };

    fetchTickets();
  }, []);

  // Fetch only employees with role "employee"
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "employee");
      if (error) {
        console.error("Error fetching employees:", error);
      } else {
        setEmployees(data);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle ticket assignment and show inline notification
  const handleAssign = async (employee) => {
    if (!selectedTicket) return;

    const { error } = await supabase.from("assignments").insert({
      ticket_id: selectedTicket.id,
      user_id: employee.id,
    });
    if (error) {
      console.error("Error assigning ticket:", error);
      setSuccessMessage("Error assigning ticket");
    } else {
      setSuccessMessage(`Ticket assigned to ${employee.name} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsModalOpen(false);
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"
      } p-6 bg-gray-100 min-h-screen mt-16 rounded-2xl`}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaTicketAlt className="text-[#23486A]" size={28} />
        <h2 className="text-2xl font-semibold text-[#23486A]">Assign Tickets</h2>
      </div>

      {/* Notification displayed outside the modal */}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-xl text-center">
          {successMessage}
        </div>
      )}

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
                <td className="p-4">{ticket.email}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-white text-sm rounded-xl ${
                      ticket.priority === "High"
                        ? "bg-[#EFB036]"
                        : ticket.priority === "Medium"
                        ? "bg-[#3B6790]"
                        : "bg-[#23486A]"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsModalOpen(true);
                    }}
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg w-[40rem] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-center w-full">
              Assign Employee
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>
          </div>
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
          <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ul>
              {filteredEmployees.map((employee) => (
                <li
                  key={employee.id}
                  className="flex justify-between items-center py-3 border-b last:border-none"
                >
                  <div>
                    <span className="text-gray-800 font-semibold">
                      {employee.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {employee.role}
                      {employee.department ? ` - ${employee.department}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssign(employee)}
                    className="px-3 py-1 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
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
