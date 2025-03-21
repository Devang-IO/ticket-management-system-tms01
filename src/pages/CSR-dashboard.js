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
  Label,
} from "recharts";
import Navbar from "../components/Navbar";
import { FaClock, FaTasks, FaCheckCircle, FaStar } from "react-icons/fa";
import { supabase } from "../utils/supabase";
// Import Chart.js auto-registration to fix "category" scale errors
import "chart.js/auto";
import { format } from "date-fns";

// --- Pastel Card Classes (from your AdminAnalyticsDashboard screenshot) ---
const cardBase = "p-4 rounded-lg border";
const cardOpen = `${cardBase} bg-yellow-50 border-yellow-100 text-yellow-700`;       // Open
const cardUnassigned = `${cardBase} bg-orange-50 border-orange-100 text-orange-600`; // Unassigned
const cardResponse = `${cardBase} bg-blue-50 border-blue-100 text-blue-600`;         // First Response
const cardSLA = `${cardBase} bg-green-50 border-green-100 text-green-700`;           // SLA
const cardCSAT = `${cardBase} bg-purple-50 border-purple-100 text-purple-600`;       // CSAT
const cardWorkload = `${cardBase} bg-indigo-50 border-indigo-100 text-indigo-600`;   // Workload

// Page container and card styles (similar to your AdminAnalyticsDashboard)
const pageContainer = "w-full min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden";
const mainContent = "pt-24 px-4 lg:px-8 mx-auto max-w-[100vw]";
const gridContainer = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6";
const cardContainer = "bg-white rounded-lg shadow-md p-4 mb-4";
const cardTitle = "text-lg font-semibold text-blue-800 mb-2 text-center";

const CSRdashboard = () => {
  const [ticketSummary, setTicketSummary] = useState([]);
  const [ticketChartData, setTicketChartData] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data (ticket summary, chart data, etc.)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Calculate timestamp for the start of today (used for cards)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartISO = todayStart.toISOString();

        // --- LIVE TICKETS DATA (Cards) ---
        const { data: openTicketsData, error: openError } = await supabase
          .from("tickets")
          .select("id, assignments(*)")
          .eq("status", "open");
        if (openError) {
          console.error("Error fetching open tickets:", openError);
        }
        const openTicketsCount = openTicketsData ? openTicketsData.length : 0;
        const assignedCount = openTicketsData
          ? openTicketsData.filter(
              (ticket) =>
                ticket.assignments && ticket.assignments.length > 0
            ).length
          : 0;
        const unassignedCount = openTicketsCount - assignedCount;

        // --- RESPONSE TIME TODAY DATA (Cards) ---
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
          avgResponseTime = Math.round(totalResponseTime / answeredData.length / 60000);
        }

        // --- EMPLOYEE WORKLOAD (Tickets Assigned for Cards) ---
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

        // --- BUILD SUMMARY DATA (Cards) ---
        const summary = [
          {
            section: "Live Tickets",
            items: [
              {
                label: "Open Tickets",
                value: openTicketsCount,
                cardClass: cardOpen,        // Pastel for "Open"
                icon: <FaTasks />,
              },
              {
                label: "Unassigned",
                value: unassignedCount,
                cardClass: cardUnassigned,  // Pastel for "Unassigned"
                icon: <FaClock />,
              },
            ],
          },
          {
            section: "Response Time Today",
            items: [
              {
                label: "First Response Time",
                value: avgResponseTime ? `${avgResponseTime}m` : "N/A",
                cardClass: cardResponse,   // Pastel Blue
                icon: <FaClock />,
              },
              {
                label: "SLA Compliance",
                value: avgResponseTime && avgResponseTime <= 30 ? "100%" : "0%",
                cardClass: cardSLA,        // Pastel Green
                icon: <FaCheckCircle />,
              },
            ],
          },
          {
            section: "CSAT Today",
            items: [
              {
                label: "CSAT",
                value: "89%",
                cardClass: cardCSAT,       // Pastel Purple
                icon: <FaCheckCircle />,
              },
            ],
          },
          {
            section: "Employee Workload",
            items: [
              {
                label: "Tickets Assigned",
                value: assignmentsCount,
                cardClass: cardWorkload,   // Pastel Indigo
                icon: <FaCheckCircle />,
              },
            ],
          },
        ];
        setTicketSummary(summary);

        // --- TICKET CHART DATA (Assigned vs Unassigned Tickets - All Time) ---
        const { data: allTickets, error: allError } = await supabase
          .from("tickets")
          .select("created_at, assignments(*)");
        if (allError) {
          console.error("Error fetching all tickets:", allError);
        }
        // Group by hour-of-day from each ticket's created_at
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const chartDataFromBackend = hours.map((hour) => {
          const label = `${hour.toString().padStart(2, "0")}:00`;
          const assigned = allTickets
            ? allTickets.filter((ticket) => {
                const date = new Date(ticket.created_at);
                return (
                  date.getHours() === hour &&
                  ticket.assignments &&
                  ticket.assignments.length > 0
                );
              }).length
            : 0;
          const unassigned = allTickets
            ? allTickets.filter((ticket) => {
                const date = new Date(ticket.created_at);
                return (
                  date.getHours() === hour &&
                  (!ticket.assignments || ticket.assignments.length === 0)
                );
              }).length
            : 0;
          return { time: label, assigned, unassigned };
        });
        setTicketChartData(chartDataFromBackend);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch customer feedback for the logged-in employee only
  useEffect(() => {
    const fetchFeedback = async () => {
      const { data: currentUserData } = await supabase.auth.getUser();
      const currentUserId = currentUserData?.user?.id;
      const { data, error } = await supabase
        .from("employee_ratings")
        .select("experience_text, rating, created_at, customer:customer_id(email, profile_picture)")
        .eq("employee_id", currentUserId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching feedback:", error.message);
      } else {
        setFeedback(data);
      }
    };

    fetchFeedback();
  }, []);

  // Render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={index < rating ? "text-yellow-400" : "text-gray-400"}
            size={16}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={pageContainer}>
      <Navbar />
      <div className={mainContent}>
        {/* Ticket Summary Section */}
        <div className={`${gridContainer} animate-fadeIn`}>
          {ticketSummary.map((section, index) => (
            <div key={index} className={cardContainer}>
              <h2 className={cardTitle}>{section.section}</h2>
              <div className="grid gap-3">
                {section.items.map((item, i) => (
                  <div key={i} className={item.cardClass + " flex items-center justify-center gap-3"}>
                    <span className="text-white text-xl">{item.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {isLoading ? "..." : item.value}
                      </h2>
                      <p className="text-sm">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-fadeIn">
          {/* Assigned vs Unassigned Tickets Chart */}
          <div className={`${cardContainer} relative h-[500px]`}>
            <h3 className={`${cardTitle} mb-4`}>Assigned vs Unassigned Tickets</h3>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={ticketChartData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="time" stroke="#23486A">
                    <Label
                      value="Time of the Day"
                      offset={-20}
                      position="insideBottom"
                      fill="#23486A"
                    />
                  </XAxis>
                  <YAxis stroke="#23486A">
                    <Label
                      value="Number of Tickets"
                      angle={-90}
                      position="insideLeft"
                      fill="#23486A"
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      color: "white",
                    }}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Line
                    type="monotone"
                    dataKey="assigned"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Assigned Tickets"
                    dot={{ stroke: "#8884d8", strokeWidth: 2, r: 4 }}
                    activeDot={{ stroke: "#8884d8", strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unassigned"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Unassigned Tickets"
                    dot={{ stroke: "#82ca9d", strokeWidth: 2, r: 4 }}
                    activeDot={{ stroke: "#82ca9d", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Feedback Section */}
          <div className={cardContainer}>
            <h3 className={`${cardTitle} mb-4`}>Customer Feedback</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-3" style={{ scrollbarWidth: "none" }}>
              {/* Hide scrollbar for Chrome, Safari, Opera */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {feedback.length === 0 ? (
                <p>No feedback available</p>
              ) : (
                feedback.map((fb, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-white p-3 rounded-lg shadow"
                  >
                    <img
                      src={
                        fb.customer?.profile_picture ||
                        "https://via.placeholder.com/50"
                      }
                      alt={fb.customer?.email || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="mb-1">{renderStars(fb.rating)}</div>
                      <p>{fb.experience_text}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(fb.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* (Optional) Ticket Submission or Rating Modal */}
    </div>
  );
};

export default CSRdashboard;
