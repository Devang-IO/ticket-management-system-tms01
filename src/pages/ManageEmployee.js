import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { supabase } from "../utils/supabase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageEmployees = ({ isSidebarOpen }) => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data: employeesData, error: empError } = await supabase
        .from("users")
        .select("id, name, profile_picture")
        .eq("role", "employee");

      if (empError) {
        console.error("Error fetching employees:", empError);
        return;
      }

      const { data: ratingsData, error: ratingError } = await supabase
        .from("employee_ratings")
        .select("employee_id, rating");

      if (ratingError) {
        console.error("Error fetching ratings:", ratingError);
      }

      const ratingMap = {};
      ratingsData?.forEach((r) => {
        if (ratingMap[r.employee_id]) {
          ratingMap[r.employee_id].sum += r.rating;
          ratingMap[r.employee_id].count += 1;
        } else {
          ratingMap[r.employee_id] = { sum: r.rating, count: 1 };
        }
      });

      const { data: solvedData, error: solvedError } = await supabase
        .from("tickets")
        .select("closed_by")
        .eq("status", "closed");

      if (solvedError) {
        console.error("Error fetching solved tickets:", solvedError);
      }

      const solvedMap = {};
      solvedData?.forEach((ticket) => {
        if (ticket.closed_by) {
          solvedMap[ticket.closed_by] = (solvedMap[ticket.closed_by] || 0) + 1;
        }
      });

      const merged = employeesData.map((emp) => {
        const avgRating = ratingMap[emp.id]
          ? (ratingMap[emp.id].sum / ratingMap[emp.id].count).toFixed(1)
          : "0.0";
        const solvedCount = solvedMap[emp.id] || 0;
        return {
          ...emp,
          avgRating,
          solvedCount,
        };
      });
      setEmployees(merged);
    };

    fetchEmployees();
  }, []);

  // Open modal and store selected employee ID
  const confirmRemoveEmployee = (id) => {
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
  };

  // Remove employee from Supabase
  const handleRemoveEmployee = async () => {
    if (selectedEmployeeId) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedEmployeeId);

      if (error) {
        console.error("Error removing employee:", error);
        alert("Failed to remove employee");
      } else {
        setEmployees((prev) =>
          prev.filter((emp) => emp.id !== selectedEmployeeId)
        );
        toast.success("Employee removed successfully");
      }
    }
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"
      } p-6 bg-gray-100 min-h-screen mt-16`}
    >
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-[#23486A]" size={28} />
          <h2 className="text-2xl font-semibold text-[#23486A]">
            Manage Employees
          </h2>
        </div>
        <div className="overflow-auto max-h-[500px] rounded-b-2xl">
          <table className="w-full border-collapse">
            <thead className="bg-[#3B6790] text-white sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Employee Name</th>
                <th className="p-4 text-left">Rating</th>
                <th className="p-4 text-left">Tickets Solved</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold text-[#23486A]">{emp.id}</td>
                  <td className="p-4 text-[#23486A] font-semibold">
                    {emp.name}
                  </td>
                  <td className="p-4 text-[#23486A]">{emp.avgRating}/5</td>
                  <td className="p-4 text-[#23486A]">{emp.solvedCount}</td>
                  <td className="p-4">
                    <button
                      onClick={() => confirmRemoveEmployee(emp.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Are you sure?
            </h2>
            <p className="text-gray-600">
              Do you really want to remove this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveEmployee}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageEmployees;
