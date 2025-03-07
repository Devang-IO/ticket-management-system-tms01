import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Tickets from "../pages/Tickets";
import TicketDetails from "../pages/TicketDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ClosedTickets from "../pages/ClosedTickets";

const AppRoutes = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

const MainLayout = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const noSidebarPaths = ["/", "/login", "/register"];
  const noNavbarPaths = ["/", "/login", "/register"];

  // Sidebar state for toggling width dynamically
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      {/* Show Sidebar only if NOT on login/register pages */}
      {!noSidebarPaths.includes(location.pathname) && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* Main content section that shrinks/expands based on sidebar */}
      <div
        style={{
          flexGrow: 1,
          overflow: "auto",
          transition: "margin-left 0.3s ease",
          marginLeft: sidebarOpen ? "250px" : "60px", // Adjust sidebar width dynamically
        }}
      >
        {/* Conditionally Render Navbar */}
        {isAuthenticated && !noNavbarPaths.includes(location.pathname) && <Navbar />}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/home/*" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
          <Route path="/tickets/closed" element={<ClosedTickets />} />
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
};

export default AppRoutes;
