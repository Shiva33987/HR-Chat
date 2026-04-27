import React, { useState } from "react";
import { login } from "../api";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await login(email, password);
      localStorage.setItem("hr_user", JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (e, qEmail, qPass) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEmail(qEmail);
    setPassword(qPass);
    try {
      const { data } = await login(qEmail, qPass);
      localStorage.setItem("hr_user", JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-glass-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <p>Secure Enterprise Access</p>
          </div>
        </div>

        <div className="quick-login-card">
          <h2>Quick Access</h2>
          <p>Sign in instantly as:</p>
          <div className="quick-buttons">
            <button 
              className="quick-btn admin"
              onClick={(e) => handleQuickLogin(e, "hr@company.com", "HR_Manager_Secure_!2026_X#")}
            >
              <span className="icon">🛡️</span>
              <div className="btn-label">
                <strong>HR Manager</strong>
                <span>Administrator</span>
              </div>
            </button>

            <button 
              className="quick-btn employee"
              onClick={(e) => handleQuickLogin(e, "emp1@company.com", "John_Doe_Employee_!2026_Z$")}
            >
              <span className="icon">👤</span>
              <div className="btn-label">
                <strong>John Doe</strong>
                <span>Employee</span>
              </div>
            </button>

            <button 
              className="quick-btn employee"
              onClick={(e) => handleQuickLogin(e, "emp2@company.com", "Sarah_Staff_Secret_!2026_Y%")}
            >
              <span className="icon">👩‍💼</span>
              <div className="btn-label">
                <strong>Sarah Staff</strong>
                <span>Employee</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
