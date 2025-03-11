import React from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const stats = [
    { label: "Total Tickets", value: 24, icon: "💼", bgColor: "#EFB036" },
    { label: "New Tickets", value: 18, icon: "✉️", bgColor: "#3B6790" },
    { label: "Open Tickets", value: 23, icon: "🔓", bgColor: "#23486A" },
    { label: "Closed Tickets", value: 1, icon: "🔒", bgColor: "#4C7B8B" },
    { label: "Un-Answered Tickets", value: 20, icon: "⬅️", bgColor: "#EFB036" },
    { label: "Answered Tickets", value: 1, icon: "✅", bgColor: "#3B6790" },
    { label: "Solved Tickets", value: 3, icon: "👍", bgColor: "#23486A" },
    { label: "Urgent Tickets", value: 5, icon: "⚠️", bgColor: "#4C7B8B" },
  ];

  const tickets = [
    { title: "Final Redirection", updated: "2025-03-09 13:18:19", action: "Solved", status: "Opened", statusColor: "#3B6790" },
    { title: "Redirection Test", updated: "2025-03-08 11:21:56", action: "Answered", status: "Opened", statusColor: "#3B6790" },
    { title: "Electricity Issue", updated: "2025-03-07 11:03:28", action: "Solved", status: "Opened", statusColor: "#3B6790" },
    { title: "Network Problem", updated: "2025-03-06 09:05:55", action: "Un-Answered", status: "Closed", statusColor: "#EFB036" },
  ];

  const chartData = {
    labels: stats.map((stat) => stat.label),
    datasets: [
      {
        label: "Ticket Count",
        data: stats.map((stat) => stat.value),
        backgroundColor: stats.map((stat) => stat.bgColor),
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Ticket Statistics", color: "#23486A", font: { size: 18 } },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#23486A", font: { size: 12 } },
      },
      y: {
        grid: { color: "#e0e0e0" },
        ticks: { color: "#23486A", font: { size: 12 } },
      },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-[#23486A]">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 rounded-lg text-white" style={{ backgroundColor: stat.bgColor }}> 
            <div className="text-xl">{stat.icon}</div>
            <p className="text-lg font-semibold">{stat.value}</p>
            <p className="text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tickets Table & Chart Side by Side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#3B6790]">Recent Tickets</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-[#23486A]">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Updated</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 text-blue-600 cursor-pointer">{ticket.title}</td>
                  <td className="p-2">{ticket.updated}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded bg-gray-300">{ticket.action}</span>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-white" style={{ backgroundColor: ticket.statusColor }}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow flex justify-center items-center">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Footer with Buttons */}
      <div className="flex justify-between items-center mt-6 p-4 bg-[#EFB036] text-white rounded-lg shadow">
        <span className="text-lg font-semibold">Manage your tickets efficiently</span>
        <div className="space-x-4">
          <Link to="/managetickets">
            <button className="px-4 py-2 bg-[#3B6790] hover:bg-[#23486A] rounded-lg shadow">Manage Tickets</button>
          </Link>
          <Link to="/assigntickets">
            <button className="px-4 py-2 bg-[#4C7B8B] hover:bg-[#23486A] rounded-lg shadow">Assign Tickets</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;