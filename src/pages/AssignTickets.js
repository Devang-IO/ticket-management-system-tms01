import React, { useState, useEffect } from "react";
import { FiUserPlus, FiX, FiSearch } from "react-icons/fi";
import { FaTicketAlt } from "react-icons/fa";
import Modal from "react-modal";
import { supabase } from "../utils/supabase"; // Import Supabase client

// Optional: configure Modal's app element (for accessibility)
Modal.setAppElement("#root");

const AdminTicketList = ({ isSidebarOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch tickets from Supabase (including assignments)
  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, assignments(*)")
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

  // Split tickets into unassigned and assigned arrays
  const unassignedTickets = tickets.filter(
    (ticket) => !ticket.assignments || ticket.assignments.length === 0
  );
  const assignedTickets = tickets.filter(
    (ticket) => ticket.assignments && ticket.assignments.length > 0
  );

  // Handle ticket assignment (or reassignment)
  const handleAssign = async (employee) => {
    if (!selectedTicket) return;

    // Check if the ticket is already assigned to the same employee
    if (
      selectedTicket.assignments &&
      selectedTicket.assignments.some(
        (assignment) => assignment.user_id === employee.id
      )
    ) {
      setSuccessMessage(`Ticket already assigned to ${employee.name}`);
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    // Insert assignment and return the inserted row
    const { data: newAssignmentData, error } = await supabase
      .from("assignments")
      .insert({
        ticket_id: selectedTicket.id,
        user_id: employee.id,
      })
      .select();

    if (error) {
      console.error("Error assigning ticket:", error);
      setSuccessMessage("Error assigning ticket");
    } else {
      // Attach employee's name to the assignment so we can show it later
      const newAssignment = {
        ...newAssignmentData[0],
        employee_name: employee.name,
      };

      setSuccessMessage(`Ticket assigned to ${employee.name} successfully!`);
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => {
          if (ticket.id === selectedTicket.id) {
            const updatedAssignments = ticket.assignments
              ? [...ticket.assignments, newAssignment]
              : [newAssignment];
            return { ...ticket, assignments: updatedAssignments };
          }
          return ticket;
        })
      );
      
      // Send assignment email notification to the ticket owner
      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket: {
              name: selectedTicket.name, // Ticket owner name
              email: selectedTicket.email, // Ticket owner's email
              title: selectedTicket.title,
              assignedEmployee: employee.name, // Newly assigned employee
            },
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          console.error("Email sending failed:", result.error);
        } else {
          console.log("Assignment email sent successfully:", result.message);
        }
      } catch (emailError) {
        console.error("Error calling email endpoint:", emailError);
      }

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
        <h2 className="text-2xl font-semibold text-[#23486A]">
          Assign Tickets
        </h2>
      </div>

      {/* Notification displayed outside the modal */}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-xl text-center">
          {successMessage}
        </div>
      )}

      {/* Unassigned Tickets Section */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden mb-6">
        <h3 className="p-4 text-xl font-semibold text-[#23486A] border-b">
          Unassigned Tickets
        </h3>
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
            {unassignedTickets.map((ticket) => (
              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">{ticket.email}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-white text-sm rounded-xl ${
                      ticket.priority === "high"
                        ? "bg-[#EFB036]"
                        : ticket.priority === "medium"
                        ? "bg-[#3B6790]"
                        : ticket.priority === "low"
                        ? "bg-[#4C7B8B]"
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

      {/* Assigned Tickets Section */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <h3 className="p-4 text-xl font-semibold text-[#23486A] border-b">
          Assigned Tickets
        </h3>
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#23486A] text-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedTickets.map((ticket) => (
              <tr key={ticket.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.title}</td>
                <td className="p-4">
                  {ticket.assignments && ticket.assignments.length > 0
                    ? ticket.assignments
                        .map((assignment) => {
                          const employee = employees.find(
                            (emp) => emp.id === assignment.user_id
                          );
                          return employee ? employee.name : "Unknown";
                        })
                        .join(", ")
                    : "Unassigned"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-white text-sm rounded-xl ${
                      ticket.priority === "high"
                        ? "bg-[#EFB036]"
                        : ticket.priority === "medium"
                        ? "bg-[#3B6790]"
                        : ticket.priority === "low"
                        ? "bg-[#4C7B8B]"
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
                    Reassign <FiUserPlus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
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
