import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Tickets from "../pages/Tickets";
import TicketDetails from "../pages/TicketDetails";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import Navbar from "../components/Navbar"; // Import Navbar
import ClosedTickets from "../pages/ClosedTickets";
import Sidebar from "../components/Sidebar"; 


const AppRoutes = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true"; // Check if the user is an admin
  const location = useLocation();

  // Conditionally render the Sidebar based on authentication and route
  const showSidebar = isAuthenticated && location.pathname !== "/" && location.pathname !== "/register" && location.pathname !== "/login";

  return (
    <Router>
      <AuthWrapper />
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
    </Router>
  );
};

// Wrapper to conditionally show Navbar based on authentication status
const AuthWrapper = ({ isAuthenticated }) => {
  const location = useLocation();
  
  const noNavbarPaths = ["/", "/login", "/register"];
  
  // Conditionally render Navbar only if the user is authenticated and not on excluded paths
  return isAuthenticated && !noNavbarPaths.includes(location.pathname) ? <Navbar /> : null;
};

const MainApp = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return (
    <Router>
      <AuthWrapper isAuthenticated={isAuthenticated} />
      <AppRoutes />
    </Router>
  );
};

export default MainApp;
