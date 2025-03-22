// QuixkyBot.jsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const sampleQuestions = [
  "How to create a ticket?",
  "How to update my ticket?",
  "What is the response time?",
];

// 3D Model Component: Loads the polar bear GLB file, scales it up,
// and makes its head (i.e. the whole model) look at the cursor.
function PolarBearModel({ mouse }) {
  const modelRef = useRef();
  const gltf = useLoader(GLTFLoader, "/polarbear.glb");

  useFrame(({ camera }) => {
    if (modelRef.current) {
      // Create a vector in 3D space that the bear should look at
      // We use a fixed Z value to ensure consistent behavior
      const target = new THREE.Vector3(
        mouse.x * 3, // Multiply by a factor to adjust sensitivity
        mouse.y * 3, 
        5 // Fixed Z distance in front of the bear
      );
      
      // Make the model look at the computed target
      modelRef.current.lookAt(target);
      
      // Optional: Add slight rotation limits to make movement more natural
      // This keeps the bear from rotating too extremely
      const rotation = modelRef.current.rotation;
      rotation.x = THREE.MathUtils.clamp(rotation.x, -0.5, 0.5);
      rotation.y = THREE.MathUtils.clamp(rotation.y, -0.8, 0.8);
    }
  });

  return (
    // Scale up the model (adjust the scale factor as needed)
    <group ref={modelRef} scale={[3, 3, 3]}>
      <primitive object={gltf.scene} castShadow />
    </group>
  );
}

// Icon component that renders the 3D polar bear with a transparent background and shadow.
const PolarBearIcon = ({ mouse }) => (
  <Canvas
    style={{ width: "100%", height: "100%", background: "transparent" }}
    shadows
    camera={{ position: [0, 1, 3] }}
  >
    {/* Increase ambient light for better color visibility */}
    <ambientLight intensity={0.5} />
    {/* Adjust directional light position, intensity, and color */}
    <directionalLight
      position={[5, 5, 5]}
      intensity={20}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      color="#ffffff"
    />
    {/* Optional: Add a point light to fill in shadows */}
    <pointLight position={[-5, -5, -5]} intensity={0.5} />
    <PolarBearModel mouse={mouse} />
    {/* Ground plane to receive shadow */}
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[10, 10]} />
      <shadowMaterial opacity={0.3} />
    </mesh>
  </Canvas>
);

const QuixkyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Conversation history initialization
  const [conversation, setConversation] = useState([
    {
      sender: "bot",
      text: "Hi, welcome to QuickAssist, I am Quixky, how can I help you?"
    },
    { sender: "bot", type: "sample", questions: sampleQuestions }
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Global mouse state normalized between -1 and 1.
  const [globalMouse, setGlobalMouse] = useState({ x: 0, y: 0 });

  // Update global mouse position regardless of where the cursor is.
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * .6 - 1;
      const y = - (event.clientY / window.innerHeight) * 1 + 1;
      setGlobalMouse({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  // Send a query to the API.
  const sendQuery = async (userQuery) => {
    setConversation((prev) => [...prev, { sender: "user", text: userQuery }]);
    setLoading(true);
    setQuery("");
    try {
      const response = await axios.post(
        process.env.REACT_APP_MISTRAL_API_URL, // e.g., "https://api.mistral.ai/v1/chat/completions"
        {
          model: "mistral-small-latest",
          messages: [{ role: "user", content: userQuery }],
          max_tokens: 100,
          temperature: 0.7,
          top_p: 1
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.REACT_APP_MISTRAL_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      const botResponse =
        response.data.choices[0]?.message?.content ||
        "I don't have an answer right now.";
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

  // Render conversation messages and sample question buttons.
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
            marginBottom: "10px"
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              background: msg.sender === "user" ? "#d1e7dd" : "#f8d7da",
              borderRadius: "15px"
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
      {/* Collapsed button with the 3D polar bear icon */}
      {!isOpen && (
        <button
          onClick={toggleModal}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "80px", // Adjusted size for larger icon
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "transparent",
            cursor: "pointer",
            padding: 0,
            border: "none"
          }}
        >
          <PolarBearIcon mouse={globalMouse} />
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
              zIndex: 1000
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                borderBottom: "1px solid #eee"
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
                borderTop: "1px solid #eee"
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
                    border: "1px solid #ccc"
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
                    borderRadius: "4px"
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