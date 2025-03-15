import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase";
import { FaTimes, FaPaperPlane, FaImage, FaSpinner } from "react-icons/fa";

const ChatBox = ({ ticketId, currentUser, assignedUserId, ticketCreatorId, onChatClosed }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherPartyInfo, setOtherPartyInfo] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Cloudinary credentials from .env
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  // Compute the other party ID based on current user's perspective.
  // If currentUser.id === assignedUserId, then current user is employee so other party is ticket creator.
  // Otherwise, current user is the ticket creator so other party is the assigned employee.
  useEffect(() => {
    if (!currentUser || !assignedUserId || !ticketCreatorId) return;
    const computedOtherPartyId = currentUser.id === assignedUserId ? ticketCreatorId : assignedUserId;
    const fetchOtherPartyInfo = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, role, profile_picture")
        .eq("id", computedOtherPartyId)
        .single();
      if (error) {
        console.error("Error fetching other party info:", error);
      } else {
        setOtherPartyInfo(data);
      }
    };
    fetchOtherPartyInfo();
  }, [currentUser, assignedUserId, ticketCreatorId]);

  // Helper: Upload image to Cloudinary with loading indication
  async function uploadToCloudinary(file) {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      throw new Error("Cloudinary upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  // Fetch existing messages & subscribe for realtime updates
  useEffect(() => {
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  // Auto-scroll to bottom whenever messages update (including image messages)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send a new message (with optional image)
  const handleSend = async () => {
    if (!currentUser || !currentUser.id) {
      console.error("Current user is undefined. Cannot send message.");
      return;
    }
    let imageUrl = null;
    if (selectedFile) {
      try {
        imageUrl = await uploadToCloudinary(selectedFile);
      } catch (err) {
        console.error("Image upload failed:", err);
        return;
      }
    }
    const { error } = await supabase.from("messages").insert([
      {
        ticket_id: ticketId,
        sender_id: currentUser.id,
        content: newMessage || "",
        image_url: imageUrl || null,
      },
    ]);
    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
      setSelectedFile(null);
      // Auto-scroll is handled by the useEffect on messages.
    }
  };

  // Modal: Confirm close chat
  const confirmCloseChat = async () => {
    const { error } = await supabase
      .from("tickets")
      .update({ chat_initiated: false })
      .eq("id", ticketId);
    if (error) {
      console.error("Error closing chat:", error);
    } else {
      // Immediately update parent state so chat is hidden without refresh.
      onChatClosed();
    }
    setShowCloseModal(false);
  };

  // Helper: Format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header with Other Party Info */}
      <div className="flex items-center justify-end mb-2 border-b pb-2">
        <div className="text-right mr-2">
          <p className="font-semibold text-gray-800">
            {otherPartyInfo?.name || "Other Party"}
          </p>
          <p className="text-sm text-gray-500">
            {otherPartyInfo?.role || ""}
          </p>
        </div>
        {otherPartyInfo?.profile_picture ? (
          <img
            src={otherPartyInfo.profile_picture}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        )}
      </div>

      {/* Messages List */}
      <div
        className="flex-1 p-4 space-y-3 overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {messages.map((msg) => {
          // Determine bubble alignment:
          // For current user, bubble is on left.
          // For the other party, bubble is on right.
          const isCurrentUser = msg.sender_id === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isCurrentUser ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-xs p-3 rounded-lg shadow ${isCurrentUser ? "bg-gray-200" : "bg-blue-100"}`}>
                {msg.image_url && (
                  <img
                    src={msg.image_url}
                    alt="Uploaded"
                    className="mb-2 max-w-full h-auto rounded"
                  />
                )}
                {msg.content && <p className="text-sm text-gray-800">{msg.content}</p>}
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formatTimestamp(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="border-t p-2">
        {/* Image Preview */}
        {selectedFile && (
          <div className="mb-2 flex items-center">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="w-12 h-12 rounded mr-2 object-cover"
            />
            <p className="text-sm text-gray-600">Image selected</p>
          </div>
        )}
        <div className="flex items-center mb-2">
          <label className="cursor-pointer mr-2 flex items-center">
            <FaImage className="text-gray-600 hover:text-blue-600" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            {uploadingImage && (
              <FaSpinner className="ml-2 animate-spin text-blue-600" />
            )}
          </label>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            disabled={uploadingImage}
          >
            <FaPaperPlane />
            Send
          </button>
        </div>
        <button
          onClick={() => setShowCloseModal(true)}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <FaTimes />
          Close Chat
        </button>
      </div>

      {/* Confirmation Modal for Close Chat */}
      {showCloseModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md w-80">
            <p className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to close chat?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={confirmCloseChat}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowCloseModal(false)}
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
