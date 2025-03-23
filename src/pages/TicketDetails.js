import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { FaArrowLeft, FaInfoCircle, FaFileAlt, FaPaperclip, FaImage } from "react-icons/fa";
import ChatBox from "../components/ChatBox";

const TicketDetails = ({ currentUser: propUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [currentUser, setCurrentUser] = useState(propUser);
  const [assignedEmployee, setAssignedEmployee] = useState(null);
  const [waitingForEmployee, setWaitingForEmployee] = useState(false);
  const [chatInitiated, setChatInitiated] = useState(false);

  // Fetch current user if not provided as prop
  useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUser(user);
      };
      fetchUser();
    }
  }, [currentUser]);

  // Fetch ticket details and assigned employee
  useEffect(() => {
    const fetchTicketAndEmployee = async () => {
      // Fetch ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (ticketError) {
        console.error("Error fetching ticket:", ticketError);
        return;
      }

      setTicket(ticketData);
      setWaitingForEmployee(ticketData.user_waiting || false);
      setChatInitiated(ticketData.chat_initiated || false);

      // Fetch assigned employee name if exists
      if (ticketData.assigned_user_id) {
        const { data: employeeData, error: employeeError } = await supabase
          .from("users")
          .select("name")
          .eq("id", ticketData.assigned_user_id)
          .single();

        if (!employeeError) {
          setAssignedEmployee(employeeData.name);
        }
      }
    };

    fetchTicketAndEmployee();

    // Set up real-time subscription for ticket updates
    const subscription = supabase
      .channel(`public:tickets:id=eq.${id}`)
      .on('UPDATE', (payload) => {
        // Update the ticket state when changes occur
        setTicket(payload.new);
        
        // Update chat initiated state directly
        setChatInitiated(payload.new.chat_initiated);
        
        // Check if employee has connected
        if (payload.new.employee_connected && !payload.old.employee_connected) {
          setWaitingForEmployee(false);
        }
      })
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  // Function to initiate connection request
  const requestConnection = async () => {
    const { error } = await supabase
      .from("tickets")
      .update({ 
        user_waiting: true 
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating ticket:", error);
      return;
    }
    
    setWaitingForEmployee(true);
  };

  // Function to cancel connection request
  const cancelRequest = async () => {
    const { error } = await supabase
      .from("tickets")
      .update({ 
        user_waiting: false 
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating ticket:", error);
      return;
    }
    
    setWaitingForEmployee(false);
  };

  // Function to handle chat closure
  const handleChatClosed = async () => {
    // Update local state immediately for UI
    setChatInitiated(false);
    
    // Update the DB
    const { error } = await supabase
      .from("tickets")
      .update({ 
        chat_initiated: false,
        user_waiting: false,
        employee_connected: false
      })
      .eq("id", id);
      
    if (error) {
      console.error("Error updating ticket chat status:", error);
    }
  };

  if (!ticket) {
    return (
      <div className="text-center text-red-500 mt-16">
        Loading ticket...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#EEF3F7] p-6  mt-16">
      {/* Page Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#23486A]">Ticket Details</h1>
        <hr className="my-4 border-t-2 border-[#3B6790]" />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Ticket Info */}
        <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-[#3B6790]">{ticket.title}</h2>

          <div className="flex items-center gap-x-6 mt-3">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="text-[#3B6790] text-xl" />
              <span className="font-bold text-lg">Status:</span>
              <span
                className={`px-3 py-1 rounded-lg text-white font-semibold text-lg shadow ${
                  ticket.status === "Open"
                    ? "bg-[#EFB036]"
                    : ticket.status === "Closed"
                    ? "bg-[#23486A]"
                    : ticket.status === "Pending"
                    ? "bg-[#3B6790]"
                    : "bg-[#4C7B8B]"
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Priority:</span>
              <span
                className={`px-3 py-1 rounded-lg text-white font-semibold text-lg shadow ${
                  ticket.priority === "High"
                    ? "bg-[#EFB036]"
                    : ticket.priority === "Medium"
                    ? "bg-[#3B6790]"
                    : "bg-[#4C7B8B]"
                }`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <FaFileAlt className="text-[#3B6790] text-xl" />
            <p className="text-lg text-[#23486A]">{ticket.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <FaPaperclip className="text-[#3B6790] text-2xl" /> Attachments
            </h3>
            {ticket.image_url ? (
              <div className="mt-4 flex items-center gap-3">
                <FaImage className="text-2xl text-[#3B6790]" />
                <img
                  src={ticket.image_url}
                  alt="Ticket attachment"
                  className="max-w-xs h-auto rounded-lg border p-1"
                />
              </div>
            ) : (
              <p className="mt-2 text-gray-500">No attachments.</p>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-[#3B6790] hover:bg-[#EFB036] text-white px-4 py-2 rounded-lg shadow-md"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {/* Right Column: Chat UI */}
        <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6 flex flex-col h-[600px] justify-center items-center">
          {chatInitiated ? (
            currentUser ? (
              <ChatBox
                ticketId={ticket.id}
                currentUser={currentUser}
                assignedUserId={ticket.assigned_user_id}
                ticketCreatorId={ticket.user_id}
                onChatClosed={handleChatClosed}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Loading user...
              </div>
            )
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#23486A] mb-4">Connect with Support</h2>
              {ticket.assigned_user_id ? (
                assignedEmployee ? (
                  <p className="text-lg text-gray-700 mb-2">
                    Your ticket is being handled by <strong>{assignedEmployee}</strong>
                  </p>
                ) : (
                  <p className="text-lg text-gray-700 mb-2">
                    Loading assigned employee...
                  </p>
                )
              ) : (
                <p className="text-lg text-gray-700 mb-2">
                  Your ticket has not yet been assigned to a support representative.
                </p>
              )}
              
              {waitingForEmployee ? (
                <div className="mt-4">
                  <div className="animate-pulse bg-orange-100 text-orange-700 p-4 rounded-lg mb-4">
                    <p className="font-semibold">Waiting for support agent to connect...</p>
                    <div className="flex justify-center mt-2">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce"></div>
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={cancelRequest}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md"
                  >
                    Cancel Request
                  </button>
                </div>
              ) : (
                <button 
                  onClick={requestConnection}
                  className="mt-4 px-6 py-3 bg-[#3B6790] hover:bg-[#EFB036] text-white font-semibold rounded-lg shadow-md"
                >
                  Request Connection
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;