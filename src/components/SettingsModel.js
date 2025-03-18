import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const SettingsModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const modalRef = useRef(null);

  // Fetch current user from Supabase auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle deletion: update dependent foreign keys then delete the user record
  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("User not found.");
      return;
    }
    setIsDeleting(true);
    try {
      // Option 2: Update dependent rows in "tickets" to set user_id to null
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ user_id: null })
        .match({ user_id: user.id });
      if (updateError) {
        throw new Error(`Failed to update tickets: ${updateError.message}`);
      }

      // Delete the user record from the custom "users" table
      const { error: deleteUserError } = await supabase
        .from("users")
        .delete()
        .match({ id: user.id });
      if (deleteUserError) {
        throw new Error(`Failed to delete user record: ${deleteUserError.message}`);
      }

      toast.success("Account deleted successfully!");

      // Sign out and redirect to homepage or login page
      await supabase.auth.signOut();
      window.location.href = "/"; // Update this path as needed
    } catch (error) {
      console.error("Error deleting account:", error.message);
      toast.error("Failed to delete account: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-80 max-w-md border border-gray-300 dark:border-gray-700 transform transition-all"
        style={{
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.8)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            ⚙️ Settings
          </h2>
          <button
            className="text-gray-500 hover:text-red-600 transition duration-200"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-900 dark:text-gray-100">🌙 Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-gray-100 rounded-full shadow-md transform transition-all peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* Delete Account Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
            ⚠️ Danger Zone
          </h3>
          {showConfirmation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow"
            >
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex justify-between">
                <button
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              className="w-full px-4 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
              onClick={() => setShowConfirmation(true)}
            >
              Delete Account
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
