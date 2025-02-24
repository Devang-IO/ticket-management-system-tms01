import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registering with", { name, email, password, phone });
    alert("Registration Successful!");
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Register</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number (Optional)</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-btn">Sign-Up</button>
      </form>
      <div className="login-link">
        <p>
          Already have an account?{" "}
          <span className="login-link-text" onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
