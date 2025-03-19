import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from '../utils/supabase';
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordModal({ isOpen, onClose, token }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    minLength: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Ensure we have a valid session when the component loads
  useEffect(() => {
    if (!isOpen) return;

    const initializeAuth = async () => {
      // Check if we already have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // If no session and we're in reset flow, try to use the hash parameters
      if (!sessionData?.session) {
        try {
          // Parse the hash or URL parameters
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          // If we have tokens in the URL and it's a recovery
          if (accessToken && type === 'recovery') {
            // Set the session manually
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            console.log("Set auth session from URL parameters");
          }
        } catch (error) {
          console.error("Error setting auth session:", error);
        }
      }
    };

    initializeAuth();
  }, [isOpen]);

  // Password validation function
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    // Update password validation checks
    setPasswordChecks({
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[@$!%*?&]/.test(value),
      minLength: value.length >= 8,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (!validatePassword(newPassword)) {
      setPasswordError(
        "❌ Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("❌ Passwords do not match");
      return;
    }
    
    setPasswordError(""); // Clear error if valid
    setIsSubmitting(true);

    try {
      // First, check if we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      
      let error;
      
      if (sessionData?.session) {
        // If we have a session, use updateUser
        const { error: updateError } = await supabase.auth.updateUser({ 
          password: newPassword 
        });
        error = updateError;
      } else {
        // If we don't have a session, try to use the recovery flow
        // This uses a special endpoint for password recovery
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // First set the session with the token
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          // Then update the password
          const { error: updateError } = await supabase.auth.updateUser({ 
            password: newPassword 
          });
          error = updateError;
        } else {
          error = new Error("No authentication session or token found");
        }
      }

      if (error) throw error;

      toast.success("Password has been reset successfully!");
      setResetSuccess(true);
      
      // After 2 seconds, close the modal and redirect to login
      setTimeout(() => {
        onClose();
        // Sign out the user to clear any recovery session
        supabase.auth.signOut().then(() => {
          navigate("/login");
          // Refresh the page to ensure clean state
          window.location.reload();
        });
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state when the modal is closed
  const handleClose = () => {
    if (!isSubmitting) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setResetSuccess(false);
      onClose();
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Close button */}
        <button 
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Reset Password
        </h2>

        {resetSuccess ? (
          <div className="text-center">
            <div className="mb-4 text-green-500 text-6xl flex justify-center">
              ✅
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Password Reset Complete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been successfully reset. You'll be redirected to login shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label 
                htmlFor="newPassword" 
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="password-checks space-y-2 mb-4">
              <div className={`flex items-center gap-2 transition-all duration-300 ${passwordChecks.uppercase ? 'text-green-500' : 'text-gray-400'}`}>
                <input type="checkbox" checked={passwordChecks.uppercase} readOnly className="form-checkbox" />
                <span className="text-sm">Uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 transition-all duration-300 ${passwordChecks.lowercase ? 'text-green-500' : 'text-gray-400'}`}>
                <input type="checkbox" checked={passwordChecks.lowercase} readOnly className="form-checkbox" />
                <span className="text-sm">Lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 transition-all duration-300 ${passwordChecks.number ? 'text-green-500' : 'text-gray-400'}`}>
                <input type="checkbox" checked={passwordChecks.number} readOnly className="form-checkbox" />
                <span className="text-sm">Number</span>
              </div>
              <div className={`flex items-center gap-2 transition-all duration-300 ${passwordChecks.specialChar ? 'text-green-500' : 'text-gray-400'}`}>
                <input type="checkbox" checked={passwordChecks.specialChar} readOnly className="form-checkbox" />
                <span className="text-sm">Special character</span>
              </div>
              <div className={`flex items-center gap-2 transition-all duration-300 ${passwordChecks.minLength ? 'text-green-500' : 'text-gray-400'}`}>
                <input type="checkbox" checked={passwordChecks.minLength} readOnly className="form-checkbox" />
                <span className="text-sm">8 characters or more</span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label 
                htmlFor="confirmPassword" 
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Password Error */}
            {passwordError && (
              <div className="mb-4 text-red-500 text-sm">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}