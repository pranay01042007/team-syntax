import React, { useState } from "react";
import { UserPlus, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = ({ onNavigateLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    store_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        store_name: formData.role === "VENDOR" ? formData.store_name.trim() : undefined,
      };

      const user = await register(payload);
      onRegisterSuccess(user);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "4rem 1.5rem", maxWidth: "480px" }}>
      <div className="card" style={{ padding: "2.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "48px", height: "48px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <UserPlus size={22} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Join MarketHub</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Create an account to browse products or sell goods
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                type="button"
                className={`btn ${formData.role === "CUSTOMER" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFormData({ ...formData, role: "CUSTOMER" })}
              >
                Customer / Buyer
              </button>
              <button
                type="button"
                className={`btn ${formData.role === "VENDOR" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFormData({ ...formData, role: "VENDOR" })}
              >
                Merchant / Vendor
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              * Administrator accounts are system-provisioned only.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Alex Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {formData.role === "VENDOR" && (
            <div className="form-group">
              <label className="form-label">Merchant Store Name *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Acme Tech Studio"
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              required
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-control"
              required
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Registering Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <button
            onClick={onNavigateLogin}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
