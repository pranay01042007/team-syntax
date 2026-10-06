import React, { useState, useEffect } from "react";
import { Package, ArrowRight, Clock, ShoppingBag } from "lucide-react";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const OrdersPage = ({ onSelectOrder, onStartShopping }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading purchase history...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>My Order History</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Track deliveries, check items, and review past marketplace transactions.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "500px", margin: "0 auto" }}>
          <Package size={48} color="var(--text-light)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Orders Yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            When you purchase items from our verified vendors, your trackable orders will appear here.
          </p>
          <button className="btn btn-primary" onClick={onStartShopping}>
            Explore Products
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="card card-hover"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.75rem", flexWrap: "wrap", gap: "1rem", cursor: "pointer" }}
              onClick={() => onSelectOrder(order)}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Order #{order.id}</span>
                  <StatusBadge status={order.order_status} />
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={14} />
                  <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Amount</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>${order.total_amount.toFixed(2)}</div>
                </div>

                <button className="btn btn-outline btn-sm">
                  Track Order <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
