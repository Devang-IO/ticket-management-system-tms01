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

  // Fetch ticket details (should include assigned_user_id, user_id, and chat_initiated)
  useEffect(() => {
    const fetchTicket = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching ticket:", error);
      } else {
        setTicket(data);
      }
    };

    fetchTicket();
  }, [id]);

  if (!ticket) {
    return (
      <div className="text-center text-red-500 mt-16">
        Loading ticket...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#EEF3F7] p-6 pl-20">
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
        <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6 flex flex-col h-[600px]">
          {ticket.chat_initiated ? (
            currentUser ? (
              <ChatBox
                ticketId={ticket.id}
                currentUser={currentUser}
                assignedUserId={ticket.assigned_user_id}
                ticketCreatorId={ticket.user_id}
                onChatClosed={() => setTicket({ ...ticket, chat_initiated: false })}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Loading user...
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chat not initiated.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
