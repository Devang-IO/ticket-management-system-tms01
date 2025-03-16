import React, { useState } from "react";
import { FiChevronDown, FiTrash2 } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";

const ManageEmployees = ({ isSidebarOpen }) => {
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Doe", rating: 4.5, ticketsSolved: 12 },
    { id: 2, name: "Jane Smith", rating: 3.8, ticketsSolved: 8 },
    { id: 3, name: "Alice Johnson", rating: 4.2, ticketsSolved: 10 },
  ]);

  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Toggle dropdown for employee
  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  // Handle employee removal
  const handleRemoveEmployee = (id) => {
    if (window.confirm("Are you sure you want to remove this employee?")) {
      setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
    }
  };

  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"} p-6 bg-gray-100 min-h-screen mt-16`}>
      {/* Employee Section Container */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden p-6">
        {/* Header Section */}
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-[#23486A]" size={28} />
          <h2 className="text-2xl font-semibold text-[#23486A]">Manage Employees</h2>
        </div>

        {/* Employee Table Container */}
        <div className="overflow-auto max-h-[500px] rounded-b-2xl">
          <table className="w-full border-collapse">
            <thead className="bg-[#3B6790] text-white sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Employee Name</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  {/* ID */}
                  <td className="p-4 font-semibold text-[#23486A]">{employee.id}</td>

                  {/* Employee Name with Dropdown */}
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(employee.id)}
                        className="flex items-center gap-2 text-[#23486A] font-semibold hover:text-[#4C7B8B]"
                      >
                        {employee.name} <FiChevronDown />
                      </button>

                      {/* Dropdown */}
                      {dropdownOpen === employee.id && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20">
                          <p className="text-sm font-semibold text-[#23486A]">
                            Rating: {employee.rating}/5
                          </p>
                          <p className="text-sm text-[#4C7B8B]">
                            Tickets Solved: {employee.ticketsSolved}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Action (Remove Button) */}
                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;
