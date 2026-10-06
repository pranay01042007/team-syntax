import React, { useState, useEffect } from "react";
import { Package, DollarSign, Clock, CheckCircle2, Plus, Store, ShoppingBag } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const VendorDashboard = ({ onNavigateProducts, onNavigateOrders, onNavigateProfile, onOpenCreateModal }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    pending_orders: 0,
    processing_orders: 0,
    delivered_orders: 0,
    total_sales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorStats = async () => {
      try {
        setLoading(true);
        const data = await api.getVendorDashboard();
        setStats(data);
      } catch (err) {
        console.error("Failed to load vendor stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorStats();
  }, []);

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge" style={{ backgroundColor: "#dcfce7", color: "#166534", marginBottom: "0.5rem" }}>
            Vendor Merchant Portal
          </span>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
            {user?.vendor_profile?.store_name || "Merchant Dashboard"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Real-time catalog oversight, order pipeline monitoring, and store metrics.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={16} /> Add Product
          </button>
          <button className="btn btn-outline" onClick={onNavigateProfile}>
            <Store size={16} /> Store Profile
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid-dashboard-stats">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Revenue
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>
                ${stats.total_sales.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: "0.75rem", background: "var(--primary-light)", borderRadius: "var(--radius-md)", color: "var(--primary)" }}>
              <DollarSign size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Verified simulated merchant settlement</span>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Catalog Products
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>
                {stats.active_products} / {stats.total_products}
              </div>
            </div>
            <div style={{ padding: "0.75rem", background: "#fef3c7", borderRadius: "var(--radius-md)", color: "#b45309" }}>
              <Package size={24} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: "0.75rem" }} onClick={onNavigateProducts}>
            Manage Catalog
          </button>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Pending / New Orders
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#d97706", marginTop: "0.25rem" }}>
                {stats.pending_orders}
              </div>
            </div>
            <div style={{ padding: "0.75rem", background: "#fef3c7", borderRadius: "var(--radius-md)", color: "#d97706" }}>
              <Clock size={24} />
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Awaiting merchant processing</span>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Delivered Orders
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#15803d", marginTop: "0.25rem" }}>
                {stats.delivered_orders}
              </div>
            </div>
            <div style={{ padding: "0.75rem", background: "#dcfce7", borderRadius: "var(--radius-md)", color: "#15803d" }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: "0.75rem" }} onClick={onNavigateOrders}>
            View Fulfillment Queue
          </button>
        </div>
      </div>

      {/* Quick Launchpad Actions */}
      <div className="card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>Merchant Workflow Launchpad</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Quick shortcuts to update product inventories, monitor buyer orders, and change shipment states.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={16} /> Publish New Product
          </button>
          <button className="btn btn-secondary" onClick={onNavigateProducts}>
            <Package size={16} /> View Products Inventory
          </button>
          <button className="btn btn-secondary" onClick={onNavigateOrders}>
            <ShoppingBag size={16} /> Process Customer Orders
          </button>
          <button className="btn btn-outline" onClick={onNavigateProfile}>
            <Store size={16} /> Edit Store Information
          </button>
        </div>
      </div>
    </div>
  );
};
