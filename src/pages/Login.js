import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });

    if (email && password) {
      alert("Login Successful!");
      navigate("/home");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleForgetPassword = () => {
    alert("Redirecting to password recovery...");
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-btn">Log in</button>
      </form>
      <button onClick={handleForgetPassword} className="forgot-password-btn">
        Forget Password
      </button>
      <p className="signup-link">
        Don't have an account? <Link to="/register">Sign-Up</Link>
      </p>
    </div>
  );
}
