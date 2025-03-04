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

const AppRoutes = () => {
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

// Wrapper to conditionally show Navbar based on localStorage
const AuthWrapper = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const noNavbarPaths = ["/", "/login", "/register"];

  return isAuthenticated && !noNavbarPaths.includes(location.pathname) ? <Navbar /> : null;
};

export default AppRoutes;