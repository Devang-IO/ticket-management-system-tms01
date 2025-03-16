import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { supabase } from "../utils/supabase"; // Import Supabase client
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
  const [stats, setStats] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Calculate timestamp for 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();

        // Fetch ticket statistics with Promise.all
        const [
          totalTicketsResult,
          newTicketsResult,
          openTicketsResult,
          closedTicketsResult,
          urgentTicketsResult,
          unansweredTicketsResult,
          answeredTicketsResult,
        ] = await Promise.all([
          // Total tickets count
          supabase.from("tickets").select("count", { head: true, count: "exact" }),
          // New tickets count (created in last 24 hours)
          supabase.from("tickets").select("count", { head: true, count: "exact" }).gt("created_at", twentyFourHoursAgo),
          // Open tickets count
          supabase.from("tickets").select("count", { head: true, count: "exact" }).eq("status", "open"),
          // Closed tickets count
          supabase.from("tickets").select("count", { head: true, count: "exact" }).eq("status", "closed"),
          // Urgent tickets count (priority High) - case insensitive
          supabase.from("tickets").select("count", { head: true, count: "exact" }).ilike("priority", "high"),
          // Unanswered tickets: open tickets older than 24 hours
          supabase
            .from("tickets")
            .select("count", { head: true, count: "exact" })
            .eq("status", "open")
            .lt("created_at", twentyFourHoursAgo),
          // Answered tickets: status answered
          supabase.from("tickets").select("count", { head: true, count: "exact" }).eq("status", "answered"),
        ]);

        setStats([
          {
            label: "Total Tickets",
            value: totalTicketsResult.count || 0,
            icon: "💼",
            bgColor: "#EFB036",
          },
          {
            label: "New Tickets",
            value: newTicketsResult.count || 0,
            icon: "✉️",
            bgColor: "#3B6790",
          },
          {
            label: "Open Tickets",
            value: openTicketsResult.count || 0,
            icon: "🔓",
            bgColor: "#23486A",
          },
          {
            label: "Closed Tickets",
            value: closedTicketsResult.count || 0,
            icon: "🔒",
            bgColor: "#4C7B8B",
          },
          {
            label: "Urgent Tickets",
            value: urgentTicketsResult.count || 0,
            icon: "⚠️",
            bgColor: "#4C7B8B",
          },
          {
            label: "Un-Answered Tickets",
            value: unansweredTicketsResult.count || 0,
            icon: "⬅️",
            bgColor: "#EFB036",
          },
          {
            label: "Answered Tickets",
            value: answeredTicketsResult.count || 0,
            icon: "✅",
            bgColor: "#3B6790",
          },
          {
            label: "Solved Tickets",
            value: closedTicketsResult.count || 0,
            icon: "👍",
            bgColor: "#23486A",
          },
        ]);

        // Fetch recent tickets
        const { data: ticketsData, error } = await supabase
          .from("tickets")
          .select("id, title, created_at, status, priority")
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) {
          console.error("Error fetching tickets:", error);
          return;
        }

        setRecentTickets(
          ticketsData?.map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            updated: new Date(ticket.created_at).toLocaleString(),
            action:
              ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
            status: ticket.status === "open" ? "Opened" : "Closed",
            statusColor: ticket.status === "open" ? "#3B6790" : "#EFB036",
            priority: ticket.priority,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const [topPerformers, setTopPerformers] = useState([
    {
      id: 1,
      username: "John Doe",
      role: "Employee",
      solved_tickets: 45,
      profile_pic: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      username: "Jane Smith",
      role: "Employee",
      solved_tickets: 38,
      profile_pic: "https://via.placeholder.com/50",
    },
    {
      id: 3,
      username: "Alice Johnson",
      role: "Employee",
      solved_tickets: 32,
      profile_pic: "https://via.placeholder.com/50",
    },
  ]);

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
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Ticket Statistics",
        color: "#23486A",
        font: { size: 15 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#23486A", font: { size: 10 } },
      },
      y: {
        grid: { color: "#e0e0e0" },
        ticks: { color: "#23486A", font: { size: 10 } },
      },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-[#23486A]">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: stat.bgColor }}
          >
            <div className="text-xl">{stat.icon}</div>
            <p className="text-lg font-semibold">
              {isLoading ? "..." : stat.value}
            </p>
            <p className="text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tickets Table & Top Performers Side by Side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#3B6790]">
            Recent Tickets
          </h2>
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
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    Loading tickets...
                  </td>
                </tr>
              ) : recentTickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    No tickets found
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <Link
                        to={`/managetickets?ticketId=${ticket.id}`}
                        className="text-blue-600 cursor-pointer"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="p-2">{ticket.updated}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 rounded bg-gray-300">
                        {ticket.action}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className="px-2 py-1 rounded text-white"
                        style={{ backgroundColor: ticket.statusColor }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Top Performers Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#3B6790]">
            Top Performers
          </h2>
          {isLoading ? (
            <p>Loading top performers...</p>
          ) : (
            <ul>
              {topPerformers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-4 p-2 border-b"
                >
                  <img
                    src={user.profile_pic || "default-avatar.png"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">
                      {user.username} ({user.role})
                    </p>
                    <p className="text-sm text-gray-600">
                      Solved Tickets: {user.solved_tickets}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-4 rounded-lg shadow flex justify-center items-center mt-4" style={{ height: "250px" }}>
        {isLoading ? (
          <div>Loading chart data...</div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Footer with Buttons */}
      <div className="flex justify-between items-center mt-6 p-4 bg-[#EFB036] text-white rounded-lg shadow">
        <span className="text-lg font-semibold">
          Manage your tickets efficiently
        </span>
        <div className="space-x-4">
          <Link to="/managetickets">
            <button className="px-4 py-2 bg-[#3B6790] hover:bg-[#23486A] rounded-lg shadow">
              Manage Tickets
            </button>
          </Link>
          <Link to="/assigntickets">
            <button className="px-4 py-2 bg-[#4C7B8B] hover:bg-[#23486A] rounded-lg shadow">
              Assign Tickets
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
