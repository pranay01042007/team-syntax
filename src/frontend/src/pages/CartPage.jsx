import React from "react";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export const CartPage = ({ onCheckout, onContinueShopping, onNavigateLogin }) => {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();

  if (!isAuthenticated || !isCustomer) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto", padding: "3rem 2rem" }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Customer Sign-In Required</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Please log in with a customer account to access your shopping cart and complete purchases.
          </p>
          <button className="btn btn-primary" onClick={onNavigateLogin}>
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto", padding: "3rem 2rem" }}>
          <ShoppingBag size={48} color="var(--text-light)" style={{ margin: "0 auto 1.5rem" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Your Cart is Empty</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Explore our curated selection of quality items and find your next favorite purchase.
          </p>
          <button className="btn btn-primary" onClick={onContinueShopping}>
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem" }}>Shopping Cart ({cart.item_count} items)</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
        {/* Cart Item Listing */}
        <div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{item.product_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Available stock: {item.product_stock}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>${item.product_price.toFixed(2)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", width: "fit-content" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.2rem 0.5rem" }}
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1 || loading}
                        >
                          -
                        </button>
                        <span style={{ padding: "0 0.6rem", fontWeight: 700, fontSize: "0.85rem" }}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.2rem 0.5rem" }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product_stock || loading}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--text-main)" }}>
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ border: "none", color: "var(--danger)" }}
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <button className="btn btn-outline btn-sm" onClick={onContinueShopping}>
              <ArrowLeft size={15} /> Continue Shopping
            </button>
            <button className="btn btn-danger btn-sm" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-subtle)" }}>
              Order Summary
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${cart.total_amount.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Estimated Shipping</span>
              <span style={{ fontWeight: 600, color: "var(--success)" }}>FREE</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", margin: "1.25rem 0", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)", fontSize: "1.2rem", fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: "var(--primary)" }}>${cart.total_amount.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
              onClick={onCheckout}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
              Prices and inventory are securely verified on backend checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
