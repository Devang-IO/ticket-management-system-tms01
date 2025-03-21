import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

// Pastel-style page container and text
const pageContainer =
  "mt-20 p-4 md:p-6 bg-gray-50 min-h-screen text-gray-800"; // Added pt-24
const pageTitle = "text-2xl md:text-3xl font-bold text-gray-800 mb-4";
const searchBarClass =
  "flex items-center w-full max-w-lg bg-white border border-gray-300 text-gray-600 rounded-full px-4 py-2 mb-6 shadow-md";
const tableContainer = "w-full overflow-x-auto";
const tableClass =
  "w-full text-left border-collapse shadow-md rounded-xl overflow-hidden";
const tableHeaderClass = "bg-blue-50 border-b border-blue-100 text-blue-800";
const tableRowBase = "bg-white text-gray-800";
const tableCellClass = "p-4";

// Pastel status classes based on ticket status
const getStatusClass = (status) => {
  const s = status.toLowerCase();
  if (s === "open") {
    // "Open" => Yellow pastel
    return "bg-yellow-50 border border-yellow-100 text-yellow-800";
  } else if (s === "answered") {
    // "answered" => Blue pastel
    return "bg-blue-50 border border-blue-100 text-blue-800";
  } else if (s === "closed") {
    // "closed" => Green pastel
    return "bg-green-50 border border-green-100 text-green-800";
  }
  // Default or unknown => Teal pastel
  return "bg-teal-50 border border-teal-100 text-teal-800";
};

const UserRequest = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [blinkingTickets, setBlinkingTickets] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("assignments")
        .select(
          "ticket: tickets(id, title, created_at, priority, status, chat_initiated, user_waiting)"
        )
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        // Extract tickets and filter out closed ones
        const assignedTickets = data.map((assignment) => assignment.ticket);
        const activeTickets = assignedTickets.filter(
          (ticket) => ticket.status !== "closed"
        );

        // Identify tickets that have user_waiting === true
        const waitingTicketIds = activeTickets
          .filter((ticket) => ticket.user_waiting)
          .map((ticket) => ticket.id);

        setBlinkingTickets(waitingTicketIds);
        setTickets(activeTickets);
      }
    };

    if (currentUser) {
      fetchAssignedTickets();

      // Set up real-time subscription for changes in "tickets" table
      const subscription = supabase
        .channel("public:tickets")
        .on("UPDATE", (payload) => {
          // Update the local ticket list
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
            )
          );

          // If user_waiting turned true, highlight ticket
          if (payload.new.user_waiting && !payload.old.user_waiting) {
            setBlinkingTickets((prev) =>
              prev.includes(payload.new.id) ? prev : [...prev, payload.new.id]
            );

            // Optional: Play notification sound
            try {
              const audio = new Audio("/notification-sound.mp3");
              audio.play().catch((e) => console.log("Audio play failed:", e));
            } catch (error) {
              console.log("Audio initialization failed:", error);
            }
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);

  // Filter tickets based on search query (by title)
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  // Sort tickets: user_waiting tickets first, then by creation date desc
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.user_waiting && !b.user_waiting) return -1;
    if (!a.user_waiting && b.user_waiting) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Update ticket to "answered", enable chat, then navigate
  const handleConnect = async (ticketId) => {
    const { error } = await supabase
      .from("tickets")
      .update({
        status: "answered",
        chat_initiated: true,
        user_waiting: false,
        employee_connected: true,
        employee_waiting: true,
      })
      .eq("id", ticketId);

    if (error) {
      console.error("Error updating ticket:", error);
      return;
    }

    // Remove from blinking tickets
    setBlinkingTickets((prev) => prev.filter((id) => id !== ticketId));

    // Navigate to ticket details
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div className={pageContainer}>
      <h1 className={pageTitle}>User Requests</h1>

      {/* Search Bar */}
      <div className={searchBarClass}>
        <input
          type="text"
          placeholder="Search tickets..."
          className="ml-2 flex-1 outline-none bg-transparent placeholder-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tickets Table */}
      <div className={tableContainer}>
        <table className={tableClass}>
          <thead className={tableHeaderClass}>
            <tr>
              <th className={tableCellClass}>Ticket ID</th>
              <th className={tableCellClass}>Title</th>
              <th className={tableCellClass}>Created Date</th>
              <th className={tableCellClass}>Status</th>
              <th className={tableCellClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.map((ticket) => {
              const isBlinking = blinkingTickets.includes(ticket.id);

              return (
                <tr
                  key={ticket.id}
                  className={`${tableRowBase} ${
                    isBlinking ? "animate-pulse" : ""
                  }`}
                  style={
                    isBlinking
                      ? {
                          backgroundColor: "#FFE0B2", // Light orange
                          boxShadow: "0 0 8px #FF9800", // Orange glow
                          transition: "background-color 0.5s, box-shadow 0.5s",
                        }
                      : {}
                  }
                >
                  <td className={tableCellClass}>{ticket.id}</td>
                  <td className={`${tableCellClass} font-medium`}>
                    {ticket.title}
                    {isBlinking && (
                      <span className="ml-2 inline-block px-2 py-1 bg-orange-500 text-white text-sm rounded-full animate-bounce">
                        User waiting!
                      </span>
                    )}
                  </td>
                  <td className={tableCellClass}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className={tableCellClass}>
                    {/* Status Pill in pastel style */}
                    <span
                      className={`inline-block px-2 py-1 rounded font-semibold ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                    {ticket.chat_initiated && (
                      <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        Chat Active
                      </span>
                    )}
                  </td>
                  <td className={tableCellClass}>
                    {ticket.chat_initiated ? (
                      <button
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                      >
                        Join Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(ticket.id)}
                        className={`${
                          isBlinking
                            ? "bg-orange-500 animate-pulse"
                            : "bg-yellow-300 hover:bg-yellow-400"
                        } text-black px-4 py-2 rounded-full font-medium transition-colors`}
                      >
                        {isBlinking ? "Connect Now!" : "Connect"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRequest;
