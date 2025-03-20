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
      // Get the current user
      if (!currentUser) return;

      // Fetch assignments with joined ticket data
      const { data, error } = await supabase
        .from("assignments")
        .select("ticket: tickets(id, title, created_at, priority, status, chat_initiated, user_waiting)")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching assigned tickets:", error);
      } else if (data) {
        // Extract tickets and filter out closed ones
        const assignedTickets = data.map((assignment) => assignment.ticket);
        const activeTickets = assignedTickets.filter(ticket => ticket.status !== "closed");
        
        // Set tickets that have user_waiting to true as blinking
        const waitingTicketIds = activeTickets
          .filter(ticket => ticket.user_waiting)
          .map(ticket => ticket.id);
        
        setBlinkingTickets(waitingTicketIds);
        setTickets(activeTickets);
      }
    };

    if (currentUser) {
      fetchAssignedTickets();

      // Set up real-time subscription for assigned tickets
      const subscription = supabase
        .channel('public:tickets')
        .on('UPDATE', (payload) => {
          // Update tickets list
          setTickets(prev => 
            prev.map(ticket => 
              ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
            )
          );
          
          // Handle user waiting status
          if (payload.new.user_waiting && !payload.old.user_waiting) {
            // Add to blinking tickets if not already there
            setBlinkingTickets(prev => 
              prev.includes(payload.new.id) ? prev : [...prev, payload.new.id]
            );
            
            // Play notification sound (optional)
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

  // Filter tickets based on search query (by title)
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  // Sort tickets - put user waiting tickets first, then sort the rest
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    // First priority: user_waiting status
    if (a.user_waiting && !b.user_waiting) return -1;
    if (!a.user_waiting && b.user_waiting) return 1;
    
    // Secondary sort by status or created date if needed
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Update ticket status to "answered", enable chat, and navigate
  const handleConnect = async (ticketId) => {
    const { error } = await supabase
      .from("tickets")
      .update({ 
        status: "answered", 
        chat_initiated: true,
        user_waiting: false,  // Clear the waiting flag
        employee_connected: true,
        employee_waiting: true  // Add this flag for highlighting on user side
      })
      .eq("id", ticketId);

    if (error) {
      console.error("Error updating ticket:", error);
      return;
    }

    // Remove from blinking tickets
    setBlinkingTickets(prev => prev.filter(id => id !== ticketId));
    
    // Navigate to ticket details
    navigate(`/ticket/${ticketId}`);
  };

  return (
    <div className="pt-20 px-6 min-h-screen flex flex-col text-white">
      <h1 className="text-3xl font-bold text-[#23486A] mb-4">User Requests</h1>
      
      {/* Search Bar */}
      <div className="flex items-center w-full max-w-lg bg-[#4C7B8B] text-white rounded-full px-4 py-2 mb-6 shadow-md">
        <input
          type="text"
          placeholder="Search tickets..."
          className="ml-2 flex-1 outline-none bg-transparent text-white placeholder-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tickets Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse shadow-md rounded-xl overflow-hidden">
          <thead className="bg-[#23486A] text-white">
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
                  className={`bg-gray-100 text-black ${isBlinking ? 'animate-pulse' : ''}`}
                  style={isBlinking ? { 
                    backgroundColor: '#FFE0B2',  // Light orange background
                    boxShadow: '0 0 8px #FF9800', // Orange glow
                    transition: 'background-color 0.5s, box-shadow 0.5s' 
                  } : {}}
                >
                  <td className="p-4">{ticket.id}</td>
                  <td className="p-4 font-medium">
                    {ticket.title}
                    {isBlinking && (
                      <span className="ml-2 inline-block px-2 py-1 bg-orange-500 text-white text-sm rounded-full animate-bounce">
                        User waiting!
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-white ${
                      ticket.status === "Open" ? "bg-[#EFB036]" :
                      ticket.status === "answered" ? "bg-[#3B6790]" :
                      "bg-[#4C7B8B]"
                    }`}>
                      {ticket.status}
                    </span>
                    {ticket.chat_initiated && (
                      <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        Chat Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {ticket.chat_initiated ? (
                      <button
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="bg-green-500 text-white px-4 py-2 rounded-full"
                      >
                        Join Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(ticket.id)}
                        className={`${isBlinking ? 'bg-orange-500 animate-pulse' : 'bg-[#EFB036]'} text-black px-4 py-2 rounded-full font-medium`}
                      >
                        {isBlinking ? 'Connect Now!' : 'Connect'}
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