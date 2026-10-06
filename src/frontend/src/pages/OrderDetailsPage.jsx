import React from "react";
import { ArrowLeft, CheckCircle, MapPin, CreditCard, Store } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { OrderTracker } from "../components/OrderTracker";

export const OrderDetailsPage = ({ order, onBack }) => {
  if (!order) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h3>Order not found</h3>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: "1rem" }}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "960px" }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={onBack}
        style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
      >
        <ArrowLeft size={16} /> Back to All Orders
      </button>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Order #{order.id}</h1>
              <StatusBadge status={order.order_status} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Paid (Simulated)</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>
              ${order.total_amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Visual Order Tracking Timeline */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>Fulfillment Progress</h3>
          <OrderTracker orderStatus={order.order_status} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Shipping Address */}
        <div className="card">
          <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <MapPin size={18} color="var(--primary)" /> Delivery Address
          </h4>
          <div style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.6 }}>
            <p><strong>{order.shipping_name}</strong></p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
          </div>
        </div>

        {/* Payment Record */}
        <div className="card">
          <h4 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <CreditCard size={18} color="var(--primary)" /> Payment & Settlement
          </h4>
          <div style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.6 }}>
            <p><strong>Method:</strong> {order.payment_method}</p>
            <p><strong>Status:</strong> <span style={{ color: "var(--success)", fontWeight: 700 }}>{order.payment_status}</span></p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Encrypted mock transaction ID: MH-TXN-{order.id}-{Math.floor(order.total_amount * 100)}
            </p>
          </div>
        </div>
      </div>

      {/* Items Breakdown Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", fontWeight: 700 }}>
          Purchased Items ({order.items.length})
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Vendor Store</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <Store size={14} /> {item.store_name || `Vendor #${item.vendor_id}`}
                  </span>
                </td>
                <td>${item.unit_price.toFixed(2)}</td>
                <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                <td style={{ fontWeight: 800 }}>${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
