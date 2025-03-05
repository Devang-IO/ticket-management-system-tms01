import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaComments, FaFileAlt, FaInfoCircle, FaPaperclip, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const mockTickets = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Issue ${i + 1}`,
  status: ["Open", "Closed", "Pending", "Resolved"][i % 4],
  priority: ["High", "Medium", "Low"][i % 3],
  description: `Description for Issue ${i + 1}: This is a sample issue generated dynamically.`,
  comments: [
    { id: 1, user: "User1", text: `Comment 1 for Issue ${i + 1}`, time: "09:00 AM" },
    { id: 2, user: "User2", text: `Comment 2 for Issue ${i + 1}`, time: "10:30 AM" },
  ],
  attachments: [
    { name: "error_log_1.txt", link: "#" },
    { name: "screenshot1.png", link: "#" },
  ],
}));

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = mockTickets.find((t) => t.id === parseInt(id));
  const [comments, setComments] = useState(ticket?.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editedComment, setEditedComment] = useState("");

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
            {/* {Status section } */}
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-[#3B6790] text-xl" />
              <span className="font-bold text-lg">Status:</span>
              <span className={`px-3 py-1 rounded-lg text-white font-semibold text-lg  shadow ${
                ticket.status === "Open" ? "bg-[#EFB036]" :
                ticket.status === "Closed" ? "bg-[#23486A]" :
                ticket.status === "Pending" ?  "bg-[#3B6790]" : "bg-[#4C7B8B]"
              }`}>{ticket.status}</span>
            </div>
            {/* {Priority section } */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">Priority:</span>
              <span className={`px-3 py-1 rounded-lg text-white font-semibold text-lg  shadow ${
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
                {/* Attachments */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaPaperclip className="text-[#3B6790] text-2xl" /> Attachments
          </h3>
          {ticket.attachments.map((file, index) => (
            <p key={index} className="mt-2">
              <a href={file.link} className="text-[#3B6790] hover:underline text-lg">
                {file.name}
              </a>
            </p>
          ))}
        </div>
          {/* Comments Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaComments className="text-[#3B6790] text-2xl" /> Live Conversation
          </h3>
          <div className="mt-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border-t py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg text-[#23486A]">
                    {comment.user}: 
                    {editMode === comment.id ? (
                      <input
                        type="text"
                        className="ml-2 border p-2 rounded-md shadow w-2/3"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                      />
                    ) : (
                      <span className="text-gray-600"> {comment.text}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{comment.time}</p>
                </div>
              </div>
            ))}
          </div>
            {/* New Comment Input */}
          <div className="mt-4 flex">
            <input
              type="text"
              className="border rounded-md shadow p-2 w-full"
              placeholder="Type a new comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              onClick={() => {
                if (newComment.trim() === "") return;
                setComments([...comments, {
                  id: comments.length + 1,
                  user: "You",
                  text: newComment,
                  time: new Date().toLocaleTimeString(),
                }]);
                setNewComment("");
              }} 
               className="bg-[#3B6790] text-white px-4 py-2 rounded-md ml-2 shadow-md  hover:bg-[#EFB036]"
            >
              Send
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
