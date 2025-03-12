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
import AssignTickets from "../pages/AssignTickets";
import WelcomePage from "../pages/welcomepage";



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

  const showSidebar = !noSidebarPaths.includes(location.pathname);
  const showNavbar = isAuthenticated && !noNavbarPaths.includes(location.pathname);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      {/* Show Sidebar only if NOT on login/register pages */}
      {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

      {/* Main content section */}
      <div
        style={{
          flexGrow: 1,
          overflow: "auto",
          transition: "margin-left 0.3s ease",
          marginLeft: showSidebar ? (sidebarOpen ? "250px" : "60px") : "0px", // No margin when sidebar is hidden
          width: showSidebar ? "calc(100% - 250px)" : "100%", // Full width when sidebar is hidden
        }}
      >
        {/* Conditionally Render Navbar */}
        {showNavbar && <Navbar />}

        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/home/*" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
          <Route path="/tickets/closed" element={<ClosedTickets />} />
          <Route path="/assigntickets" element={<AssignTickets />} />
         
         
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
};

export default AppRoutes;
