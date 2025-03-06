import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-center" // Position of the toast notifications
        autoClose={1500} // Auto-close after 1.5 seconds
        hideProgressBar={true} // Hide the progress bar
        newestOnTop={false} // New toasts appear below older ones
        closeOnClick // Close toast on click
        rtl={false} // Left-to-right layout
        pauseOnFocusLoss // Pause toast timer when window loses focus
        draggable // Allow dragging to dismiss
        pauseOnHover // Pause toast timer on hover
      />
    </>
  );
}

export default App;