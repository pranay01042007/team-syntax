import React, { useState } from "react";
import { ArrowLeft, ShoppingCart, Store, Check, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export const ProductDetailsPage = ({ product, onBack, onNavigateCart, onNavigateLogin }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h3>Product not found</h3>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: "1rem" }}>
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      onNavigateLogin();
      return;
    }
    if (!isCustomer) {
      alert("Vendors and Admins cannot purchase products. Please log in as a Customer.");
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={onBack}
        style={{ marginBottom: "2rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "3rem" }}>
        {/* Left: Product Media */}
        <div className="card" style={{ padding: "1rem", overflow: "hidden" }}>
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: "100%", height: "420px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
            }}
          />
        </div>

        {/* Right: Product Attributes & Purchase Action */}
        <div>
          <span className="badge" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)", marginBottom: "0.75rem" }}>
            {product.category}
          </span>

          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--text-main)" }}>
            {product.name}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--text-muted)" }}>
            <Store size={16} />
            <span>Sold by <strong>{product.store_name || "Official Marketplace Vendor"}</strong></span>
          </div>

          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "1.5rem" }}>
            ${product.price.toFixed(2)}
          </div>

          <div style={{ padding: "1.25rem 0", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>About This Item</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
              {product.description}
            </p>
          </div>

          {/* Stock & Quantity */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Availability: </span>
              {isOutOfStock ? (
                <span style={{ color: "var(--danger)", fontWeight: 700 }}>Out of Stock</span>
              ) : (
                <span style={{ color: "var(--success)", fontWeight: 700 }}>
                  In Stock ({product.stock} units ready to ship)
                </span>
              )}
            </div>

            {!isOutOfStock && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Quantity:</label>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 0, padding: "0.4rem 0.8rem" }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{ padding: "0 1rem", fontWeight: 700, fontSize: "0.95rem" }}>{quantity}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 0, padding: "0.4rem 0.8rem" }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                className={`btn btn-lg ${added ? "btn-secondary" : "btn-primary"}`}
                disabled={isOutOfStock || adding}
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              {added && (
                <button className="btn btn-outline btn-lg" onClick={onNavigateCart}>
                  View Cart
                </button>
              )}
            </div>
          </div>

          {/* Secure Trust Highlights */}
          <div className="card" style={{ background: "#f8fafc", padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <span>Simulated Payment Protection</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <Truck size={20} color="var(--primary)" />
              <span>Real-Time Order Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
