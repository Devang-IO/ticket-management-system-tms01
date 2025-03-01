import React, { useState } from "react";
import { FiBell } from "react-icons/fi";

const Navbar = ({ onOpenTicket }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Your ticket has been resolved.", time: "2 hours ago" },
    { id: 2, text: "New ticket assigned to you.", time: "5 hours ago" },
    { id: 3, text: "System maintenance scheduled.", time: "1 day ago" },
  ];

  return (
    <nav className="navbar">
      <div></div>

      <div className="navbar-right">
        {/* New Ticket Button */}
        <button onClick={onOpenTicket} className="new-ticket-btn">
          + New Ticket
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2"
          >
            <FiBell size={24} className="text-gray-700" />
          </button>
          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
              </div>
              <div className="dropdown-content">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="dropdown-item">
                    <p>{notification.text}</p>
                    <p className="time-text">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <a href="/notifications" className="view-all-link" onClick={() => setNotificationsOpen(false)}>
                  View All
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile Placeholder */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="profile-placeholder"
          >
            {/* Placeholder for Profile Pic */}
            <div className="profile-pic-placeholder"></div>
          </button>
          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <h3>Profile</h3>
              </div>
              <div className="dropdown-content">
                <a href="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  View Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
