import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export const VendorProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "Electronics",
        price: "",
        stock: "",
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      });
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const priceNum = parseFloat(formData.price);
      const stockNum = parseInt(formData.stock, 10);

      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error("Price must be a positive number");
      }
      if (isNaN(stockNum) || stockNum < 0) {
        throw new Error("Stock cannot be negative");
      }

      await onSave({
        ...formData,
        price: priceNum,
        stock: stockNum,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
            {product ? "Edit Product" : "Create New Product"}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: "0.4rem" }}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Title *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ergonomic Office Chair"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="49.99"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Inventory Stock *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="25"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL *</label>
              <input
                type="url"
                className="form-control"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Description *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide key features and details..."
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : product ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
