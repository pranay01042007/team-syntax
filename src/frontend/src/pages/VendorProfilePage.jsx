import React, { useState, useEffect } from "react";
import { Store, Save, Check } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const VendorProfilePage = () => {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    store_name: "",
    description: "",
    contact_info: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getVendorProfile();
        setFormData({
          store_name: data.store_name || "",
          description: data.description || "",
          contact_info: data.contact_info || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load store profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await api.updateVendorProfile(formData);
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
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "680px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Vendor Store Settings</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage your public brand identity, marketplace bio, and buyer contact credentials.
        </p>
      </div>

      {success && <div className="alert alert-success">Store profile updated successfully!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading store data...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Store Brand Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email / Phone *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Store Description *</label>
              <textarea
                className="form-control"
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving Changes..." : <><Save size={16} /> Save Store Details</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
