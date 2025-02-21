import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });
    setIsLoggedIn(true);
    alert("Login Successful!");
  };

  return (
    <div>
      <h1>Login</h1>
      {!isLoggedIn ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Log in</button>
        </form>
      ) : (
        <div>
          <h3>Welcome!</h3>
          <p>You have successfully logged in.</p>
        </div>
      )}
      <div>
        <p>
          Don't have an account?{" "}
          <span 
            style={{ color: "#6a82fb", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Sign-Up
          </span>
        </p>
      </div>
    </div>
  );
}
