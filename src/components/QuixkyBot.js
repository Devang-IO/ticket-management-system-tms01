// QuixkyBot.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const sampleQuestions = [
  "How to create a ticket?",
  "How to update my ticket?",
  "What is the response time?",
];

const QuixkyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Initialize conversation with a welcome message and sample questions as part of the conversation history.
  const [conversation, setConversation] = useState([
    { sender: "bot", text: "Hi, welcome to QuickAssist, I am Quixky, how can I help you?" },
    { sender: "bot", type: "sample", questions: sampleQuestions }
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  // Send a query to the Mistral API using proper payload parameters
  const sendQuery = async (userQuery) => {
    // Append user's query to conversation
    setConversation((prev) => [...prev, { sender: "user", text: userQuery }]);
    setLoading(true);
    setQuery("");
    try {
      const response = await axios.post(
        process.env.REACT_APP_MISTRAL_API_URL, // "https://api.mistral.ai/v1/chat/completions"
        {
          model: "mistral-small-latest", // You can adjust this to a model available for free, e.g., "mistral-small-latest"
          messages: [
            { role: "user", content: userQuery }
          ],
          max_tokens: 150,
          temperature: 0.7,
          top_p: 1,
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.REACT_APP_MISTRAL_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      // Adjust extraction based on actual API response structure.
      const botResponse = response.data.choices[0]?.message?.content || "I don't have an answer right now.";
      setConversation((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch (error) {
      console.error("API error:", error);
      setConversation((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." }
      ]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      sendQuery(query.trim());
    }
  };

  // Render conversation: For messages with type "sample", render the question bubbles.
  const renderConversation = () => {
    return conversation.map((msg, index) => {
      if (msg.type === "sample") {
        return (
          <div key={index} style={{ marginBottom: "10px" }}>
            {msg.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendQuery(q)}
                style={{
                  background: "#e9ecef",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginRight: "5px",
                  marginBottom: "5px"
                }}
              >
                {q}
              </button>
            ))}
          </div>
        );
      }
      return (
        <div
          key={index}
          style={{
            textAlign: msg.sender === "user" ? "right" : "left",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              background: msg.sender === "user" ? "#d1e7dd" : "#f8d7da",
              borderRadius: "15px",
            }}
          >
            {msg.text}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {/* Collapsed button with logo */}
      {!isOpen && (
        <button 
          onClick={toggleModal} 
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "4px solid #ffffff",
            boxShadow: "0 8px 15px rgba(0, 0, 0, 0.9)",
            cursor: "pointer",
            padding: 0,
          }}
          
        >
          <img 
            src="/logo.png" 
            alt="QuickAssist Logo" 
            style={{ width: "100%", height: "100%", borderRadius: "50%" }} 
          />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen &&
        ReactDOM.createPortal(
          <div 
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              width: "320px",
              height: "450px",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              zIndex: 1000,
            }}
          >
            {/* Header */}
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                borderBottom: "1px solid #eee",
              }}
            >
              <img 
                src="/logo.png" 
                alt="QuickAssist Logo" 
                style={{ width: "40px", height: "40px" }} 
              />
              <strong>Quixky Bot</strong>
              <button 
                onClick={toggleModal} 
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            {/* Conversation Area */}
            <div 
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto"
              }}
            >
              {renderConversation()}
            </div>

            {/* Input Area */}
            <div 
              style={{
                padding: "10px",
                borderTop: "1px solid #eee",
              }}
            >
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a project-related question..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
                <button 
                  type="submit" 
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  {loading ? "Loading..." : "Send"}
                </button>
              </form>
            </div>
          </div>,
          document.getElementById("modal-root")
        )}
    </>
  );
};

export default QuixkyBot;
