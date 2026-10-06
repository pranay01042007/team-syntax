import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, Package } from "lucide-react";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load vendor orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      await fetchVendorOrders();
    } catch (err) {
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Vendor Customer Orders</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Orders containing items manufactured or sold by your store. Update fulfillment status to inform buyers.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "500px", margin: "0 auto" }}>
          <Package size={48} color="var(--text-light)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Orders Placed Yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            As customers purchase your products, fulfillment requests will appear here in real-time.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Order #{order.id}</span>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Placed on {new Date(order.created_at).toLocaleString()} by {order.customer_name || "Customer"}
                  </div>
                </div>

                {/* Status Update Control */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>Update Status:</label>
                  <select
                    className="form-control"
                    style={{ width: "160px", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                    value={order.order_status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Shipping Details */}
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
                <strong>Shipping Destination:</strong> {order.shipping_name}, {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
              </div>

              {/* Item details */}
              <div style={{ fontSize: "0.9rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Order Items:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px dashed var(--border-subtle)" }}>
                      <span>
                        {item.quantity}× <strong>{item.product_name}</strong>
                      </span>
                      <span style={{ fontWeight: 700 }}>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
