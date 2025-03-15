import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

const ChatBox = ({ ticketId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new messages in real time
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Check if currentUser is defined and has an id
    if (!currentUser || !currentUser.id) {
      console.error("Current user is undefined. Cannot send message.");
      return;
    }

    const { error } = await supabase.from("messages").insert([
      {
        ticket_id: ticketId,
        sender_id: currentUser.id,
        content: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id}>
              <p className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleString()}
              </p>
              <p className={`font-semibold ${isCurrentUser ? "text-blue-600" : "text-green-600"}`}>
                {isCurrentUser ? "You" : "Other"}
              </p>
              <p className="text-gray-800">{msg.content}</p>
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="flex p-4 border-t border-gray-200">
        <input
          type="text"
          className="flex-1 border rounded-md p-2 mr-2"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
