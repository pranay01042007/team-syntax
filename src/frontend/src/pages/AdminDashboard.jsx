import React, { useState, useEffect } from "react";
import { Users, Store, Package, ShoppingBag, DollarSign, Shield, CheckCircle, XCircle } from "lucide-react";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    total_users: 0,
    total_customers: 0,
    total_vendors: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
  });

  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    }
  };

  const fetchTabData = async (tab) => {
    try {
      setLoading(true);
      if (tab === "users") {
        const u = await api.getAdminUsers();
        setUsers(u);
      } else if (tab === "vendors") {
        const v = await api.getAdminVendors();
        setVendors(v);
      } else if (tab === "products") {
        const p = await api.getAdminProducts();
        setProducts(p);
      } else if (tab === "orders") {
        const o = await api.getAdminOrders();
        setOrders(o);
      }
    } catch (err) {
      console.error("Failed to load tab data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab !== "overview") {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const handleToggleUser = async (userId, currentActive) => {
    try {
      await api.toggleUserStatus(userId, !currentActive);
      await fetchTabData("users");
      await fetchStats();
    } catch (err) {
      alert(err.message || "Failed to update user");
    }
  };

  const handleToggleVendor = async (vendorId, currentStatus) => {
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await api.updateAdminVendorStatus(vendorId, nextStatus);
      await fetchTabData("vendors");
      await fetchStats();
    } catch (err) {
      alert(err.message || "Failed to update vendor");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchTabData("orders");
      await fetchStats();
    } catch (err) {
      alert(err.message || "Failed to update order status");
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#991b1b", marginBottom: "0.5rem" }}>
          Superuser Control Center
        </span>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Platform Administration</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Oversee platform health, audit role access control, and manage multi-tenant merchants.
        </p>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid-dashboard-stats">
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Marketplace Volume
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>
            ${stats.total_revenue.toFixed(2)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Across {stats.total_orders} total orders</span>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Registered Users
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>
            {stats.total_users}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {stats.total_customers} Buyers • {stats.total_vendors} Vendors
          </span>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Catalog Products
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>
            {stats.total_products}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active marketplace listings</span>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Order Transactions
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>
            {stats.total_orders}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Fulfilled & in-flight orders</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", marginBottom: "1.5rem", overflowX: "auto" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "users", label: `Users (${stats.total_users})` },
          { key: "vendors", label: `Vendors (${stats.total_vendors})` },
          { key: "products", label: `Products (${stats.total_products})` },
          { key: "orders", label: `Orders (${stats.total_orders})` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm ${activeTab === tab.key ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="card" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>System Security & Audit Summary</h3>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            The MarketHub platform operates on a zero-trust model. Passwords are never stored or logged in plain text.
            Access to vendor inventories and customer purchases are isolated through verified token role policies.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>✓ Backend Password Hashing</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Bcrypt algorithm with 12 rounds work factor.</div>
            </div>
            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>✓ HTTP Security Headers</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>X-Frame-Options: DENY, X-Content-Type-Options: nosniff.</div>
            </div>
            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>✓ Price Tamper Prevention</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Cart prices and totals calculated authoritatively by DB.</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td>
                    <span className={`badge ${u.is_active ? "badge-active" : "badge-inactive"}`}>
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role !== "ADMIN" && (
                      <button
                        className={`btn btn-sm ${u.is_active ? "btn-danger" : "btn-secondary"}`}
                        onClick={() => handleToggleUser(u.id, u.is_active)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === "vendors" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Store Name</th>
                <th>Merchant User</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td style={{ fontWeight: 700 }}>{v.store_name}</td>
                  <td>{v.user?.email || `User #${v.user_id}`}</td>
                  <td>{v.contact_info}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>
                    <button
                      className={`btn btn-sm ${v.status === "ACTIVE" ? "btn-danger" : "btn-secondary"}`}
                      onClick={() => handleToggleVendor(v.id, v.status)}
                    >
                      {v.status === "ACTIVE" ? "Suspend Store" : "Activate Store"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Store</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.store_name || `Vendor #${p.vendor_id}`}</td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                  <td>{p.stock} units</td>
                  <td>
                    <span className={`badge ${p.is_active ? "badge-active" : "badge-inactive"}`}>
                      {p.is_active ? "Active" : "Archived"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>#{o.id}</td>
                  <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                  <td style={{ fontWeight: 800 }}>${o.total_amount.toFixed(2)}</td>
                  <td><StatusBadge status={o.order_status} /></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: "150px", padding: "0.3rem 0.5rem", fontSize: "0.82rem" }}
                      value={o.order_status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
