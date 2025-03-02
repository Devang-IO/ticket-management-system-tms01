import React, { useState, useEffect } from "react";

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!isOpen) return null;

  return (
    <div className="settings-modal fixed bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-72">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Settings</h2>

        {/* Theme Selection */}
        <div className="flex flex-col space-y-2">
          <button
            className={`px-4 py-2 rounded ${theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setTheme("light")}
          >
            Light Mode
          </button>
          <button
            className={`px-4 py-2 rounded ${theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setTheme("dark")}
          >
            Dark Mode
          </button>
        </div>

        {/* Close Button */}
        <button
          className="mt-4 text-sm text-red-500 hover:underline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
