import React, { useState } from "react";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage = ({ onNavigateRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await login(email.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="container" style={{ padding: "4rem 1.5rem", maxWidth: "460px" }}>
      <div className="card" style={{ padding: "2.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "48px", height: "48px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <Lock size={22} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Sign in to access your MarketHub account
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="form-control"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-control"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to MarketHub"}
          </button>
        </form>

        {/* Demo Fast Login Ribbon */}
        <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Quick Demo Login:
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: "space-between" }}
              onClick={() => handleQuickFill("customer@markethub.com", "Customer@123")}
            >
              <span>Customer Demo</span>
              <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>customer@markethub.com</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: "space-between" }}
              onClick={() => handleQuickFill("techvendor@markethub.com", "Vendor@123")}
            >
              <span>Vendor Demo (Apex Tech)</span>
              <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>techvendor@markethub.com</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: "space-between" }}
              onClick={() => handleQuickFill("admin@markethub.com", "Admin@123")}
            >
              <span>Administrator Demo</span>
              <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>admin@markethub.com</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <button
            onClick={onNavigateRegister}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
