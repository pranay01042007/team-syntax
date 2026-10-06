import React, { useState } from "react";
import { ShoppingCart, Check, Store } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export const ProductCard = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const { isCustomer, isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || !isCustomer) {
      if (onViewDetails) onViewDetails(product);
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      alert(err.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card" onClick={() => onViewDetails && onViewDetails(product)} style={{ cursor: "pointer" }}>
      <div className="product-image-container">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
          }}
        />
        {isOutOfStock && (
          <span
            className="badge badge-cancelled"
            style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}
          >
            Out of Stock
          </span>
        )}
      </div>

      <div className="product-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="product-category">{product.category}</span>
          <span style={{ fontSize: "0.75rem", color: isOutOfStock ? "#ef4444" : "#10b981", fontWeight: "600" }}>
            {isOutOfStock ? "0 in stock" : `${product.stock} available`}
          </span>
        </div>

        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-vendor" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Store size={14} />
          <span>{product.store_name || "Official Marketplace Vendor"}</span>
        </div>

        <div className="product-footer">
          <div className="product-price">${product.price.toFixed(2)}</div>
          
          <button
            className={`btn btn-sm ${added ? "btn-secondary" : "btn-primary"}`}
            disabled={isOutOfStock || adding}
            onClick={handleAdd}
            title={isOutOfStock ? "Item out of stock" : "Add to cart"}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
