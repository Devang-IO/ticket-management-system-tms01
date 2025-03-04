import React from "react";
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
import Sidebar from "../components/Sidebar"; // ✅ Import Sidebar
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
  const noSidebarPaths = ["/", "/login", "/register"]; // ❌ Hide Sidebar on these pages
  const noNavbarPaths = ["/", "/login", "/register"]; // ❌ Hide Navbar on these pages

  return (
    <div style={{ display: "flex" }}>
      {/* ✅ Show Sidebar only if NOT on login/register pages */}
      {!noSidebarPaths.includes(location.pathname) && <Sidebar />}

      <div style={{ flex: 1 }}>
        {/* ✅ Conditionally Render Navbar */}
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

        {/* ✅ Toast Notifications */}
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
};

export default AppRoutes;
