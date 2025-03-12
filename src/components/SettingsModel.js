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
    <div className="settings-modal absolute top-[-120%] left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 flex justify-center rounded-xl items-center z-50">
  <div className="bg-white dark:bg-[#23486A] p-6 rounded-xl shadow-lg w-80">
    {/* Centered Heading */}
    <h2 className="text-lg font-semibold mb-4 text-[#23486A] dark:text-[#EFB036] text-center">
      Settings
    </h2>

    {/* Theme Selection */}
    <div className="flex flex-col space-y-2">
      <button
        className={`px-4 py-2 rounded transition-all duration-300 ${
          theme === "light"
            ? "bg-[#EFB036] text-white shadow-md"
            : "bg-[#4C7B8B] text-white hover:bg-[#3B6790]"
        }`}
        onClick={() => setTheme("light")}
      >
        Light Mode
      </button>
      <button
        className={`px-4 py-2 rounded transition-all duration-300 ${
          theme === "dark"
            ? "bg-[#3B6790] text-white shadow-md"
            : "bg-[#4C7B8B] text-white hover:bg-[#23486A]"
        }`}
        onClick={() => setTheme("dark")}
      >
        Dark Mode
      </button>
    </div>

    {/* Centered Close Button */}
    <div className="mt-4 flex justify-center">
      <button
        className="text-sm text-red-500 hover:text-red-600 transition-all duration-200"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
</div>

  );
};

export default SettingsModal;
