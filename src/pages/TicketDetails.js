import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaComments, FaFileAlt, FaInfoCircle, FaPaperclip, FaEdit, FaSave, FaTimes } from "react-icons/fa";

// Sample mock data for 15 tickets
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mt-16">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Ticket Details</h1>
          <hr className="my-4 border-t-2 border-gray-300" />
        </div>

        {/* Ticket Details */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{ticket.title}</h2>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="text-blue-500 text-xl" />
              <span className="font-bold text-lg">Status:</span>
              <span className={`px-3 py-1 rounded-lg text-white font-semibold text-lg ${
                ticket.status === "Open" ? "bg-green-500" :
                ticket.status === "Closed" ? "bg-gray-500" :
                ticket.status === "Pending" ? "bg-yellow-500" : "bg-blue-500"
              }`}>{ticket.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Priority:</span>
              <span className={`px-3 py-1 rounded-lg text-white font-semibold text-lg ${
                ticket.priority === "High" ? "bg-red-500" :
                ticket.priority === "Medium" ? "bg-yellow-400" : "bg-blue-500"
              }`}>{ticket.priority}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 flex items-center gap-3">
            <FaFileAlt className="text-gray-600 text-xl" />
            <p className="text-lg text-gray-700">{ticket.description}</p>
          </div>
        </div>

        {/* Live Comments Section */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaComments className="text-blue-500 text-2xl" /> Live Conversation
          </h3>
          <div className="mt-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border-t py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {comment.user}: 
                    {editMode === comment.id ? (
                      <input
                        type="text"
                        className="ml-2 border p-1 rounded w-2/3"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                      />
                    ) : (
                      <span className="text-gray-600"> {comment.text}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{comment.time}</p>
                </div>
                {comment.user === "You" && (
                  <div className="flex gap-2">
                    {editMode === comment.id ? (
                      <>
                        <button 
                          onClick={() => {
                            setComments(comments.map(comment => 
                              comment.id === editMode ? { ...comment, text: editedComment } : comment
                            ));
                            setEditMode(null);
                          }} 
                          className="text-green-500 text-xl"
                        >
                          <FaSave />
                        </button>
                        <button 
                          onClick={() => setEditMode(null)} 
                          className="text-red-500 text-xl"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditMode(comment.id);
                          setEditedComment(comment.text);
                        }} 
                        className="text-blue-500 text-xl"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Comment */}
          <div className="mt-4 flex">
            <input
              type="text"
              className="border rounded p-2 w-full"
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
              className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            >
              Send
            </button>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <FaPaperclip className="text-green-500 text-2xl" /> Attachments
          </h3>
          {ticket.attachments.map((file, index) => (
            <p key={index} className="mt-2">
              <a href={file.link} className="text-blue-500 hover:underline text-lg">
                {file.name}
              </a>
            </p>
          ))}
        </div>

        {/* Back Button  */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            <FaArrowLeft /> Back to Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
