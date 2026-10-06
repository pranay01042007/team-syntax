import React, { useState } from "react";
import { User as UserIcon, Shield, Store, Save, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await api.request("/users/profile", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Account Profile</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Authenticated identity and access privileges for the MarketHub platform.
      </p>

      {success && <div className="alert alert-success">Profile name updated successfully!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "56px", height: "56px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserIcon size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{user?.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
              <span className="badge badge-active">{user?.role}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>ID #{user?.id}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Email Address (Login Identity)</label>
            <input
              type="text"
              className="form-control"
              disabled
              value={user?.email || ""}
              style={{ background: "#f8fafc", color: "var(--text-muted)", cursor: "not-allowed" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? "Saving..." : <><Save size={14} /> Update Display Name</>}
          </button>
        </form>
      </div>

      {user?.role === "VENDOR" && user?.vendor_profile && (
        <div className="card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Store size={18} color="var(--primary)" /> Associated Store Information
          </h3>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
            <p><strong>Store Name:</strong> {user.vendor_profile.store_name}</p>
            <p><strong>Bio:</strong> {user.vendor_profile.description || "None specified"}</p>
            <p><strong>Contact:</strong> {user.vendor_profile.contact_info || "None specified"}</p>
            <p><strong>Store Status:</strong> <span className="badge badge-active">{user.vendor_profile.status}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};
