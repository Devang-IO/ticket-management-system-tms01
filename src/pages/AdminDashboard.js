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

const EmployeeActivityStatus = () => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmp, setLoadingEmp] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmp(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, name, is_online, is_on_live_chat, last_activity_at")
        .eq("role", "employee");
      if (error) {
        console.error("Error fetching employees:", error);
      } else {
        const now = new Date();
        const computed = (data || []).map((emp) => {
          let status = "Offline";
          if (emp.is_on_live_chat) {
            status = "On Live Chat";
          } else if (emp.is_online) {
            const last = emp.last_activity_at ? new Date(emp.last_activity_at) : 0;
            status = now - last > 30 * 60 * 1000 ? "Away" : "Online";
          }
          return { ...emp, status };
        });
        setEmployees(computed);
      }
      setLoadingEmp(false);
    };
    fetchEmployees();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3 text-[#3B6790]">Employee Activity Status</h2>
      {loadingEmp ? (
        <p>Loading employee status...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-[#23486A]">
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b">
                <td className="p-2">{emp.name}</td>
                <td className="p-2">
                  <span
                    className="px-2 py-1 rounded text-white"
                    style={{
                      backgroundColor:
                        emp.status === "Online"
                          ? "#4CAF50"
                          : emp.status === "On Live Chat"
                          ? "#2196F3"
                          : emp.status === "Away"
                          ? "#FF9800"
                          : "#f44336",
                    }}
                  >
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ticket statistics and recent tickets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();

        const [
          totalTicketsResult,
          newTicketsResult,
          openTicketsResult,
          closedTicketsResult,
          urgentTicketsResult,
          unansweredTicketsResult,
          answeredTicketsResult,
        ] = await Promise.all([
          supabase.from("tickets").select("count", { head: true, count: "exact" }),
          supabase.from("tickets").select("count", { head: true, count: "exact" }).gt("created_at", twentyFourHoursAgo),
          supabase.from("tickets").select("count", { head: true, count: "exact" }).eq("status", "open"),
          supabase.from("tickets").select("count", { head: true, count: "exact" }).eq("status", "closed"),
          supabase.from("tickets").select("count", { head: true, count: "exact" }).ilike("priority", "high"),
          supabase.from("tickets").select("count", { head: true, count: "exact" }).eq("status", "open").lt("created_at", twentyFourHoursAgo),
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
            action: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
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

  // Fetch top performers based on closed tickets
  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const { data: closedTicketsData, error } = await supabase
          .from("tickets")
          .select("closed_by")
          .eq("status", "closed");

        if (error) {
          console.error("Error fetching closed tickets:", error);
          return;
        }

        const performersMap = {};
        closedTicketsData.forEach((ticket) => {
          if (ticket.closed_by) {
            performersMap[ticket.closed_by] = (performersMap[ticket.closed_by] || 0) + 1;
          }
        });

        const userIds = Object.keys(performersMap);
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, profile_picture, role")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
          return;
        }

        const performersArray = userIds.map((userId) => {
          const user = usersData.find((u) => u.id === userId);
          return {
            userId,
            name: user?.name || "Unknown",
            profile_picture: user?.profile_picture || "default-avatar.png",
            role: user?.role || "",
            solved_tickets: performersMap[userId],
          };
        });

        performersArray.sort((a, b) => b.solved_tickets - a.solved_tickets);
        setTopPerformers(performersArray);
      } catch (err) {
        console.error("Error fetching top performers:", err);
      }
    };

    fetchTopPerformers();
  }, []);

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
            <p className="text-lg font-semibold">{isLoading ? "..." : stat.value}</p>
            <p className="text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets & Employee Activity Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Tickets Section */}
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

        {/* Employee Activity Status Section */}
        <EmployeeActivityStatus />
      </div>

      {/* Chart and Top Performers Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow flex justify-center items-center" style={{ height: "250px" }}>
          {isLoading ? (
            <div>Loading chart data...</div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>

        {/* Top Performers */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-[#3B6790]">Top Performers</h2>
          {isLoading ? (
            <p>Loading top performers...</p>
          ) : topPerformers.length === 0 ? (
            <p>No performer data found.</p>
          ) : (
            <ol className="list-decimal pl-5">
              {topPerformers.map((user, index) => (
                <li key={index} className="mb-4 flex items-center gap-3">
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">
                      {user.solved_tickets} ticket{user.solved_tickets > 1 ? "s" : ""} solved
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
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
