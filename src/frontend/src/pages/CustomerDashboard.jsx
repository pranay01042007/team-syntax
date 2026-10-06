import React, { useState, useEffect } from "react";
import { Package, ShoppingBag, ShoppingCart, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const CustomerDashboard = ({ onNavigateOrders, onNavigateCart, onStartShopping, onSelectOrder }) => {
  const { user } = useAuth();
  const { cart, itemCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerOrders();
  }, []);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Welcome back, {user?.name}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Your Customer Control Center — View transactions, track orders, and manage active items.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-dashboard-stats">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total Orders Placed
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>{orders.length}</div>
            </div>
            <div style={{ padding: "0.75rem", background: "var(--primary-light)", borderRadius: "var(--radius-md)", color: "var(--primary)" }}>
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Items in Cart
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>{itemCount}</div>
            </div>
            <div style={{ padding: "0.75rem", background: "#fef3c7", borderRadius: "var(--radius-md)", color: "#b45309" }}>
              <ShoppingCart size={24} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: "1rem", width: "100%" }} onClick={onNavigateCart}>
            View Cart (${cart.total_amount.toFixed(2)})
          </button>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Active Marketplaces
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>100% Secure</div>
            </div>
            <div style={{ padding: "0.75rem", background: "#d1fae5", borderRadius: "var(--radius-md)", color: "#065f46" }}>
              <ShoppingBag size={24} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: "1rem", width: "100%" }} onClick={onStartShopping}>
            Explore Products
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Recent Purchases</h3>
          {orders.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={onNavigateOrders}>
              View All Orders ({orders.length}) <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading orders...</p>
        ) : recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>You haven't placed any orders yet.</p>
            <button className="btn btn-primary btn-sm" onClick={onStartShopping}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  border: "1px solid var(--border-subtle)",
                }}
                onClick={() => onSelectOrder(order)}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontWeight: 700 }}>Order #{order.id}</span>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {order.items.length} items • {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                    ${order.total_amount.toFixed(2)}
                  </span>
                  <button className="btn btn-secondary btn-sm">Track</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
