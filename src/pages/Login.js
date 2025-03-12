import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../utils/supabase'; // Import Supabase client

export default function LoginPage() {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    minLength: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // State for password input focus
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Update password validation checks
    setPasswordChecks({
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[@$!%*?&]/.test(value),
      minLength: value.length >= 8,
    });
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setPasswordError(
        "❌ Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }

    setPasswordError(""); // Clear error if valid

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Logged in user:", data.user);

      // Fetch user profile data from the `users` table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, role, profile_picture')
        .eq('id', data.user.id)
        .single();

      console.log("Fetched user data:", userData);

      // Store user profile data in localStorage
      if (userData) {
        localStorage.setItem("username", userData.name);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("profilePicture", userData.profile_picture);
      }

      // Display success toast notification
      toast.success("🦄 Login successful!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
      });

      // Redirect based on role
      setTimeout(() => {
        localStorage.setItem("isAuthenticated", "true");

        switch (userData?.role || 'user') {
          case 'admin':
            navigate("/admindashboard");
            break;
          case 'employee':
            navigate("/csrdashboard");
            break;
          default:
            navigate("/dashboard");
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    }
  };

  // Password visibility toggle handler
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigate to forgot password page
  const handleForgetPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Log in
          </button>
        </form>
        <button
          onClick={handleForgetPassword}
          className="block text-blue-500 text-sm mt-4 hover:underline text-center"
        >
          Forget Password?
        </button>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <Link to="/register" className="text-blue-600">Sign-Up</Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}
