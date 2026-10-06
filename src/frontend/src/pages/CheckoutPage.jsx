import React, { useState } from "react";
import { ShieldCheck, CreditCard, Banknote, Smartphone, CheckCircle, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const CheckoutPage = ({ onOrderPlaced, onBackToCart }) => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shipping_name: user?.name || "",
    shipping_address: "742 Evergreen Terrace",
    shipping_city: "Hyderabad",
    shipping_state: "Telangana",
    shipping_pincode: "500088",
    payment_method: "Simulated UPI",
  });

  const [simulatedCard, setSimulatedCard] = useState({
    card_number: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvv: "•••",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      setError("Cannot checkout an empty cart");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderPayload = {
        shipping_name: formData.shipping_name.trim(),
        shipping_address: formData.shipping_address.trim(),
        shipping_city: formData.shipping_city.trim(),
        shipping_state: formData.shipping_state.trim(),
        shipping_pincode: formData.shipping_pincode.trim(),
        payment_method: formData.payment_method,
      };

      const placedOrder = await api.checkoutOrder(orderPayload);
      await fetchCart(); // Cart is now cleared on backend
      onOrderPlaced(placedOrder);
    } catch (err) {
      setError(err.message || "Failed to process checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem", maxWidth: "900px" }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={onBackToCart}
        style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
      >
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Simulated Checkout</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Complete your order securely. Payment verification is executed in sandbox mode for hackathon demonstration.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
        {/* Left Form: Shipping & Simulated Payment */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Shipping Address */}
          <div className="card">
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
              1. Delivery Information
            </h3>

            <div className="form-group">
              <label className="form-label">Recipient Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.shipping_name}
                onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.shipping_city}
                  onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.shipping_state}
                  onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Postal Pincode *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.shipping_pincode}
                onChange={(e) => setFormData({ ...formData, shipping_pincode: e.target.value })}
              />
            </div>
          </div>

          {/* Simulated Payment Method */}
          <div className="card">
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
              2. Simulated Payment Method
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 1rem",
                  border: `2px solid ${formData.payment_method === "Simulated UPI" ? "var(--primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  background: formData.payment_method === "Simulated UPI" ? "#f5f3ff" : "white",
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Simulated UPI"
                  checked={formData.payment_method === "Simulated UPI"}
                  onChange={() => setFormData({ ...formData, payment_method: "Simulated UPI" })}
                />
                <Smartphone size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Simulated UPI (Instant Approval)</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>GPay / PhonePe / Paytm test sandbox</div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 1rem",
                  border: `2px solid ${formData.payment_method === "Simulated Card Payment" ? "var(--primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  background: formData.payment_method === "Simulated Card Payment" ? "#f5f3ff" : "white",
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Simulated Card Payment"
                  checked={formData.payment_method === "Simulated Card Payment"}
                  onChange={() => setFormData({ ...formData, payment_method: "Simulated Card Payment" })}
                />
                <CreditCard size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Simulated Card Payment</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Mock Visa / Mastercard sandbox</div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 1rem",
                  border: `2px solid ${formData.payment_method === "Cash on Delivery" ? "var(--primary)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  background: formData.payment_method === "Cash on Delivery" ? "#f5f3ff" : "white",
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Cash on Delivery"
                  checked={formData.payment_method === "Cash on Delivery"}
                  onChange={() => setFormData({ ...formData, payment_method: "Cash on Delivery" })}
                />
                <Banknote size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pay upon physical package receipt</div>
                </div>
              </label>
            </div>

            <div className="alert alert-info" style={{ fontSize: "0.8rem", padding: "0.75rem 1rem" }}>
              <ShieldCheck size={18} />
              <span>
                <strong>Zero Financial Risk:</strong> No real money or card numbers are processed. This simulation models safe transactional order state transitions.
              </span>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
              Order Review
            </h3>

            <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "1rem" }}>
              {cart.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.6rem" }}>
                  <span style={{ color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                    {item.quantity}× {item.product_name}
                  </span>
                  <span style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800 }}>
                <span>Total Due:</span>
                <span style={{ color: "var(--primary)" }}>${cart.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || cart.items.length === 0}
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
            >
              {loading ? "Placing Order..." : "Authorize & Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
