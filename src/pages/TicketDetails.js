import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaComments, FaFileAlt, FaInfoCircle, FaPaperclip, FaImage } from "react-icons/fa";
import { supabase } from "../utils/supabase"; // Import Supabase client

const TicketDetails = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  // Fetch ticket details from Supabase
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

  // Fetch comments from Supabase
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching comments:", error);
      else setComments(data);
    };

    fetchComments();
  }, [id]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoadingComment(true);

    try {
      // Insert the new comment into Supabase
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            ticket_id: id,
            text: newComment,
            user_id: currentUser.id, // Associate the comment with the logged-in user
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error adding comment:", error);
      } else {
        // Update the comments state with the new comment
        setComments([...comments, ...data]);
        setNewComment(""); // Clear the input field
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoadingComment(false);
    }
  };

  if (!ticket) {
    return <div className="text-center text-red-500">Ticket not found!</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#EEF3F7] p-6 pl-20">
      {/* { Main Container } */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full  mt-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#23486A]">Ticket Details</h1>
          <hr className="my-4 border-t-2 border-[#3B6790]" />
        </div>

        {/* Ticket Info Section */}
        <div className="bg-[#F9F9F9] p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-2xl font-semibold text-[#3B6790]">{ticket.title}</h2>
          {/* Status & Priority Container */}
          <div className="flex items-center gap-x-6 mt-3">
            {/* Status section */}
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-[#3B6790] text-xl" />
              <span className="font-bold text-lg">Status:</span>
              <span className={`px-3 py-1 rounded-lg text-white font-semibold text-lg shadow ${
                ticket.status === "Open" ? "bg-[#EFB036]" :
                ticket.status === "Closed" ? "bg-[#23486A]" :
                ticket.status === "Pending" ? "bg-[#3B6790]" : "bg-[#4C7B8B]"
              }`}>{ticket.status}</span>
            </div>
            {/* Priority section */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">Priority:</span>
              <span className={`px-3 py-1 rounded-lg text-white font-semibold text-lg shadow ${
                ticket.priority === "High" ? "bg-[#EFB036]" :
                ticket.priority === "Medium" ? "bg-[#3B6790]" : "bg-[#4C7B8B]"
              }`}>{ticket.priority}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <FaFileAlt className="text-[#3B6790] text-xl" />
            <p className="text-lg text-[#23486A]">{ticket.description}</p>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaPaperclip className="text-[#3B6790] text-2xl" /> Attachments
          </h3>
          {ticket.image_url && (
            <div className="mt-4 flex items-center gap-3">
              <FaImage className="text-2xl text-[#3B6790]" />
              <img 
                src={ticket.image_url} 
                alt="Ticket attachment" 
                className="max-w-xs h-auto rounded-lg border p-1"
              />
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaComments className="text-[#3B6790] text-2xl" /> Live Conversation
          </h3>
          <div className="mt-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border-t py-3">
                <p className="text-gray-600">{comment.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex">
            <input
              type="text"
              className="border rounded-md shadow p-2 w-full"
              placeholder="Type a new comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={loadingComment}
              className="bg-[#3B6790] text-white px-4 py-2 rounded-md ml-2 shadow-md hover:bg-[#EFB036] disabled:opacity-50"
            >
              {loadingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-[#3B6790] hover:bg-[#EFB036] text-white px-4 py-2 rounded-lg shadow-md"
          >
            <FaArrowLeft /> Back to Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;