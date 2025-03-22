import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const UserRequest = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [blinkingTickets, setBlinkingTickets] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, chat_initiated, user_waiting)")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        const assignedTickets = data.map((assignment) => assignment.ticket);
        const activeTickets = assignedTickets.filter(ticket => ticket.status !== "closed");

        // Tickets with user waiting flag become blinking
        const waitingTicketIds = activeTickets
          .filter(ticket => ticket.user_waiting)
          .map(ticket => ticket.id);
        setBlinkingTickets(waitingTicketIds);
        setTickets(activeTickets);
      }
    };

    if (currentUser) {
      fetchAssignedTickets();

      // Real-time subscription for updates
      const subscription = supabase
        .channel('public:tickets')
        .on('UPDATE', (payload) => {
          setTickets(prev =>
            prev.map(ticket =>
              ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
            )
          );
          if (payload.new.user_waiting && !payload.old.user_waiting) {
            setBlinkingTickets(prev =>
              prev.includes(payload.new.id) ? prev : [...prev, payload.new.id]
            );
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (error) {
              console.log('Audio initialization failed:', error);
            }
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.user_waiting && !b.user_waiting) return -1;
    if (!a.user_waiting && b.user_waiting) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const handleConnect = async (ticketId) => {
    const { error } = await supabase
      .from("tickets")
      .update({ 
        status: "answered", 
        chat_initiated: true,
        user_waiting: false, 
        employee_connected: true,
        employee_waiting: true
      })
      .eq("id", ticketId);

    if (error) {
      console.error("Error updating ticket:", error);
      return;
    }

    setBlinkingTickets(prev => prev.filter(id => id !== ticketId));
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div className="pt-20 px-6 min-h-screen flex flex-col" style={{ backgroundColor: "#FFF2D8", color: "#113946" }}>
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#113946" }}>
        User Requests
      </h1>
      
      {/* Search Bar */}
      <div className="flex items-center w-full max-w-lg rounded-full px-4 py-2 mb-6 shadow-md"
           style={{ backgroundColor: "#EAD7BB" }}>
        <input
          type="text"
          placeholder="Search tickets..."
          className="ml-2 flex-1 outline-none bg-transparent"
          style={{ color: "#113946" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tickets Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse shadow-md rounded-xl overflow-hidden">
          <thead style={{ backgroundColor: "#BCA37F", color: "#FFF2D8" }}>
            <tr>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Created Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.map((ticket) => {
              const isBlinking = blinkingTickets.includes(ticket.id);
              return (
                <tr
                  key={ticket.id}
                  className={isBlinking ? "animate-pulse" : ""}
                  style={
                    isBlinking
                      ? {
                          backgroundColor: "#EAD7BB",
                          boxShadow: "0 0 8px #BCA37F",
                          transition: "background-color 0.5s, box-shadow 0.5s"
                        }
                      : { backgroundColor: "#113946" }
                  }
                >
                  <td className="p-4" style={{ color: "#FFF2D8" }}>{ticket.id}</td>
                  <td className="p-4 font-medium" style={{ color: "#FFF2D8" }}>
                    {ticket.title}
                    {isBlinking && (
                      <span className="ml-2 inline-block px-2 py-1 rounded-full text-sm"
                            style={{ backgroundColor: "#BCA37F", color: "#FFF2D8" }}>
                        User waiting!
                      </span>
                    )}
                  </td>
                  <td className="p-4" style={{ color: "#FFF2D8" }}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded"
                          style={{
                            backgroundColor: ticket.status === "Open" ? "#EAD7BB" : ticket.status === "answered" ? "#BCA37F" : "#113946",
                            color: ticket.status === "Open" ? "#113946" : "#FFF2D8"
                          }}>
                      {ticket.status}
                    </span>
                    {ticket.chat_initiated && (
                      <span className="ml-2 px-2 py-1 rounded text-sm"
                            style={{ backgroundColor: "#BCA37F", color: "#FFF2D8" }}>
                        Chat Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {ticket.chat_initiated ? (
                      <button
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="px-4 py-2 rounded-full"
                        style={{ backgroundColor: "#EAD7BB", color: "#113946" }}
                      >
                        Join Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(ticket.id)}
                        className={`px-4 py-2 rounded-full font-medium ${isBlinking ? "animate-pulse" : ""}`}
                        style={{ backgroundColor: isBlinking ? "#BCA37F" : "#EAD7BB", color: "#113946" }}
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
