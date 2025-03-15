// QuixkyBot.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const QuixkyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);

  const toggleModal = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!query.trim()) return;
    // Append user's query to conversation
    setConversation((prev) => [...prev, { sender: 'user', text: query }]);
    setQuery('');

    try {
      const response = await axios.post(
        process.env.REACT_APP_MISTRAL_API_URL,
        { prompt: query, context: "Your project context details here" },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Append bot's answer to conversation
      setConversation((prev) => [
        ...prev,
        { sender: 'bot', text: response.data.answer }
      ]);
    } catch (error) {
      setConversation((prev) => [
        ...prev,
        { sender: 'bot', text: "Sorry, something went wrong." }
      ]);
    }
  };

  // Modal UI using React Portal
  if (!isOpen) {
    return (
      <button 
        onClick={toggleModal} 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Chat with Quixky
      </button>
    );
  }

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '320px',
      height: '450px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      <div style={{
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <strong>Quixky Bot</strong>
        <button onClick={toggleModal} style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer'
        }}>×</button>
      </div>
      <div style={{
        flex: 1,
        padding: '10px',
        overflowY: 'auto'
      }}>
        {conversation.map((msg, index) => (
          <div key={index} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              background: msg.sender === 'user' ? '#d1e7dd' : '#f8d7da',
              borderRadius: '15px'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        padding: '10px',
        borderTop: '1px solid #eee'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a project-related question..."
          style={{ width: '100%', padding: '8px', marginBottom: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleSend}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Send
        </button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default QuixkyBot;
