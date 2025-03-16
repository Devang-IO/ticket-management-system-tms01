import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from "recharts";
import Navbar from "../components/Navbar";
import {
  FaThumbsUp,
  FaMedal,
  FaClock,
  FaTasks,
  FaCheckCircle,
  FaUserCheck
} from "react-icons/fa";
import { supabase } from "../utils/supabase";

const CSRdashboard = () => {
  const [ticketSummary, setTicketSummary] = useState([]);
  const [ticketChartData, setTicketChartData] = useState([]);
  const [topSolvers, setTopSolvers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data including tickets summary, chart data, top solvers and employees status
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Calculate timestamps for today and 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartISO = todayStart.toISOString();

        // --- LIVE TICKETS DATA ---
        // Fetch open tickets with assignments to determine unassigned count.
        const { data: openTicketsData, error: openError } = await supabase
          .from("tickets")
          .select("id, assignments(*)")
          .eq("status", "open");
        if (openError) {
          console.error("Error fetching open tickets:", openError);
        }
        const openTicketsCount = openTicketsData ? openTicketsData.length : 0;
        const assignedCount = openTicketsData
          ? openTicketsData.filter(ticket => ticket.assignments && ticket.assignments.length > 0).length
          : 0;
        const unassignedCount = openTicketsCount - assignedCount;

        // --- RESPONSE TIME TODAY DATA ---
        // Fetch tickets answered today (assumes a "first_response_at" column exists)
        const { data: answeredData, error: answeredError } = await supabase
          .from("tickets")
          .select("created_at, first_response_at")
          .eq("status", "answered")
          .gte("created_at", todayStartISO);
        if (answeredError) {
          console.error("Error fetching answered tickets:", answeredError);
        }
        let avgResponseTime = 0;
        if (answeredData && answeredData.length > 0) {
          const totalResponseTime = answeredData.reduce((acc, ticket) => {
            if (ticket.first_response_at) {
              return acc + (new Date(ticket.first_response_at) - new Date(ticket.created_at));
            }
            return acc;
          }, 0);
          avgResponseTime = totalResponseTime / answeredData.length / 60000; // convert ms to minutes
          avgResponseTime = Math.round(avgResponseTime);
        }

        // --- EMPLOYEE WORKLOAD (Tickets Assigned) ---
        let assignmentsCount = 0;
        const { data: currentUserData } = await supabase.auth.getUser();
        const currentUserId = currentUserData?.user?.id;
        if (currentUserId) {
          const { count } = await supabase
            .from("assignments")
            .select("*", { head: true, count: "exact" })
            .eq("user_id", currentUserId);
          assignmentsCount = count || 0;
        }

        // --- BUILD SUMMARY DATA ---
        const summary = [
          {
            section: "Live Tickets",
            items: [
              { label: "Open Tickets", value: openTicketsCount, color: "bg-[#3B6790]", icon: <FaTasks /> },
              { label: "Unassigned", value: unassignedCount, color: "bg-[#23486A]", icon: <FaClock /> },
            ],
          },
          {
            section: "Response Time Today",
            items: [
              { label: "First Response Time", value: avgResponseTime ? `${avgResponseTime}m` : "N/A", color: "bg-[#4C7B8B]", icon: <FaClock /> },
              { label: "SLA Compliance", value: avgResponseTime && avgResponseTime <= 30 ? "100%" : "0%", color: "bg-[#3B6790]", icon: <FaCheckCircle /> },
            ],
          },
          {
            section: "CSAT Today",
            items: [
              { label: "CSAT", value: "89%", color: "bg-[#EFB036]", icon: <FaCheckCircle /> },
            ],
          },
          {
            section: "Employee Workload",
            items: [
              { label: "Tickets Assigned", value: assignmentsCount, color: "bg-[#23486A]", icon: <FaUserCheck /> },
            ],
          },
        ];
        setTicketSummary(summary);

        // --- TICKET CHART DATA ---
        // Fetch today's tickets and group by hour for chart data.
        const { data: todaysTickets, error: todaysError } = await supabase
          .from("tickets")
          .select("created_at, status")
          .gte("created_at", todayStartISO);
        if (todaysError) {
          console.error("Error fetching today's tickets:", todaysError);
        }
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const chartDataFromBackend = hours.map(hour => {
          const label = `${hour.toString().padStart(2, "0")}:00`;
          const newCount = todaysTickets ? todaysTickets.filter(ticket => {
            const date = new Date(ticket.created_at);
            return date.getHours() === hour && ticket.status !== "closed";
          }).length : 0;
          const closedCount = todaysTickets ? todaysTickets.filter(ticket => {
            const date = new Date(ticket.created_at);
            return date.getHours() === hour && ticket.status === "closed";
          }).length : 0;
          return { time: label, new: newCount, closed: closedCount };
        });
        setTicketChartData(chartDataFromBackend);

        // --- TOP TICKET SOLVERS ---
        // Fetch closed tickets and group by the "created_by" field.
        const { data: closedTicketsData, error: closedTicketsError } = await supabase
          .from("tickets")
          .select("created_by")
          .eq("status", "closed");
        if (closedTicketsError) {
          console.error("Error fetching closed tickets:", closedTicketsError);
        }
        const solversMap = {};
        if (closedTicketsData) {
          closedTicketsData.forEach(ticket => {
            if (ticket.created_by) {
              solversMap[ticket.created_by] = (solversMap[ticket.created_by] || 0) + 1;
            }
          });
        }
        let solversArray = Object.keys(solversMap).map(userId => ({
          userId,
          tickets: solversMap[userId]
        }));
        solversArray.sort((a, b) => b.tickets - a.tickets);
        solversArray = solversArray.slice(0, 5);
        // Fetch user details for each top solver
        const enrichedSolvers = await Promise.all(
          solversArray.map(async solver => {
            const { data: userData } = await supabase
              .from("users")
              .select("username, role, profile_pic")
              .eq("id", solver.userId)
              .single();
            return {
              name: userData?.username || solver.userId,
              role: userData?.role || "",
              tickets: solver.tickets,
              profile_pic: userData?.profile_pic || "https://via.placeholder.com/50"
            };
          })
        );
        setTopSolvers(enrichedSolvers);

        // --- EMPLOYEE STATUS ---
        // Fetch all employees from the users table (assuming role = "employee")
        const { data: employeesData, error: employeesError } = await supabase
          .from("users")
          .select("id, username, last_activity_at, is_on_live_chat, is_online")
          .eq("role", "employee");
        if (employeesError) {
          console.error("Error fetching employees:", employeesError);
        }
        // Compute status for each employee
        const computedEmployees = (employeesData || []).map(emp => {
          const now = new Date();
          let status = "Offline";
          if (emp.is_on_live_chat) {
            status = "On Live Chat";
          } else if (emp.is_online) {
            const lastActivity = emp.last_activity_at ? new Date(emp.last_activity_at) : 0;
            // If no activity for over 30 minutes, mark as Away.
            if (now - lastActivity > 30 * 60 * 1000) {
              status = "Away";
            } else {
              status = "Online";
            }
          }
          return { ...emp, status };
        });
        // We'll store computedEmployees in a state if needed for display in the Employee Status section.
        // For simplicity, we'll attach it to ticketSummary's last section.
        setTicketSummary(prev => [
          ...prev,
          {
            section: "Employee Status",
            items: computedEmployees.map(emp => ({
              label: emp.username,
              value: emp.status,
              // You can use different colors for different statuses if you like.
              color:
                emp.status === "On Live Chat"
                  ? "bg-green-600"
                  : emp.status === "Online"
                  ? "bg-blue-600"
                  : emp.status === "Away"
                  ? "bg-orange-600"
                  : "bg-gray-600",
              icon: <FaUserCheck />
            }))
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart configuration using our ticketChartData from backend
  const chartData = {
    labels: ticketChartData.map(d => d.time),
    datasets: [
      {
        label: "New Tickets",
        data: ticketChartData.map(d => d.new),
        fill: false,
        borderColor: "#8884d8",
        strokeWidth: 2,
        dot: { r: 4 },
      },
      {
        label: "Closed Tickets",
        data: ticketChartData.map(d => d.closed),
        fill: false,
        borderColor: "#82ca9d",
        strokeWidth: 2,
        dot: { r: 4 },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: "New Tickets vs Closed",
        color: "#ffffff",
        font: { size: 15 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#ccc", font: { size: 10 } },
      },
      y: {
        grid: { color: "#444" },
        ticks: { color: "#ccc", font: { size: 10 } },
      },
    },
  };

  return (
    <div className="w-full min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <div className="pt-20 px-4 lg:px-8 mx-auto w-full max-w-[100vw] overflow-hidden">
        {/* Ticket Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn ">
          {ticketSummary.map((section, index) => (
            <div key={index} className="p-4 rounded-xl shadow-md text-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 text-white">
              <h2 className="text-lg font-semibold text-gray-300 mb-2">{section.section}</h2>
              <div className="grid gap-3">
                {section.items.map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg shadow ${item.color} flex items-center justify-center gap-3`}>
                    <span className="text-white text-xl">{item.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{isLoading ? "..." : item.value}</h2>
                      <p className="text-sm">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Top Solvers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 w-full animate-fadeIn">
          {/* Ticket Chart */}
          <div className="col-span-2 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-6 rounded-xl shadow-md w-full h-[500px] relative overflow-hidden">
            <h3 className="text-xl font-semibold mb-4">New Tickets vs Closed</h3>
            <div className="p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                  <XAxis dataKey="time" stroke="#ccc">
                    <Label value="Time of the Day" offset={-20} position="insideBottom" />
                  </XAxis>
                  <YAxis>
                    <Label value="Number of Tickets" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" />
                  <Line type="monotone" dataKey="new" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} name="New Tickets" />
                  <Line type="monotone" dataKey="closed" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} name="Closed Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Ticket Solvers */}
          <div className="col-span-1 h-[500px] bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-6 rounded-xl shadow-md w-full">
            <h3 className="text-xl font-semibold mb-4">Top Ticket Solvers</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p>Loading top solvers...</p>
              ) : topSolvers.length === 0 ? (
                <p>No data available</p>
              ) : (
                topSolvers.map((solver, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg shadow">
                    <div className="bg-yellow-500 p-2 rounded-full">
                      <FaMedal className="text-white text-lg" />
                    </div>
                    <div>
                      <h4 className="text-white">{solver.name}</h4>
                      <p className="text-gray-400 text-sm">{solver.role}</p>
                      <p className="text-blue-400">{solver.tickets} tickets solved</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Customer Feedback & Employee Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 w-full animate-fadeIn">
          {/* Customer Feedback */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-6 rounded-xl shadow-md w-full">
            <h3 className="text-xl font-semibold mb-4">Customer Feedback</h3>
            <div className="space-y-3">
              {[
                { message: "Thanks for exchanging my item so promptly", time: "an hour ago" },
                { message: "Super fast resolution, thank you!", time: "an hour ago" },
                { message: "Great service as always", time: "3 hours ago" },
                { message: "Helpful and efficient. Great service!", time: "4 hours ago" },
                { message: "Fast and efficient, thanks.", time: "2 days ago" },
              ].map((feedback, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg shadow">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <FaThumbsUp className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-white">{feedback.message}</p>
                    <p className="text-gray-400 text-sm">{feedback.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Status */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-4 rounded-xl shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Employee Status</h2>
            <div className="flex justify-between text-gray-300 px-4 py-2 border-b border-gray-600">
              <span className="font-semibold">Employee</span>
              <span className="font-semibold">Status</span>
            </div>
            <div className="space-y-2 mt-2">
              {isLoading ? (
                <p>Loading employees...</p>
              ) : (
                // Assuming the fetched employees with computed status are appended to the summary,
                // you can alternatively store them in a dedicated state. Here we assume they are stored in summary.
                // For clarity, we'll fetch employees in this section.
                <EmployeeStatus />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to fetch and render employee status
const EmployeeStatus = () => {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, last_activity_at, is_on_live_chat, is_online")
        .eq("role", "employee");
      if (error) {
        console.error("Error fetching employees:", error);
      } else {
        const now = new Date();
        const computed = (data || []).map(emp => {
          let status = "Offline";
          if (emp.is_on_live_chat) {
            status = "On Live Chat";
          } else if (emp.is_online) {
            const lastActivity = emp.last_activity_at ? new Date(emp.last_activity_at) : 0;
            status = now - lastActivity > 30 * 60 * 1000 ? "Away" : "Online";
          }
          return { ...emp, status };
        });
        setEmployees(computed);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <>
      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        employees.map((emp) => (
          <div key={emp.id} className="flex justify-between items-center bg-[#2D3E50] text-white px-4 py-3 rounded-lg">
            <span className="font-medium">{emp.username}</span>
            <span className="text-gray-300">{emp.status}</span>
          </div>
        ))
      )}
    </>
  );
};

export default CSRdashboard;
