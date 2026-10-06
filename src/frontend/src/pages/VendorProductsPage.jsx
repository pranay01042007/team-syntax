import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Store } from "lucide-react";
import { api } from "../services/api";
import { VendorProductModal } from "./VendorProductModal";

export const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVendorProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      await api.updateProduct(editingProduct.id, productData);
    } else {
      await api.createProduct(productData);
    }
    await fetchVendorProducts();
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete '${name}'?`)) {
      try {
        await api.deleteProduct(id);
        await fetchVendorProducts();
      } catch (err) {
        alert(err.message || "Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Vendor Product Inventory</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Create, update stock, modify prices, and manage active marketplace listings.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Toolbar */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-control"
            placeholder="Filter own products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px", fontSize: "0.9rem" }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading catalog...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Store size={40} color="var(--text-light)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>No products in your catalog yet</h3>
          <p style={{ color: "var(--text-light)", fontSize: "0.88rem", marginTop: "0.5rem" }}>
            Click 'Add New Product' to publish your first offering to the marketplace.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.stock <= 5 ? "var(--danger)" : "var(--text-main)" }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.is_active ? "badge-active" : "badge-inactive"}`}>
                      {p.is_active ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit product details"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: "var(--danger)", borderColor: "#fecaca" }}
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VendorProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
};
