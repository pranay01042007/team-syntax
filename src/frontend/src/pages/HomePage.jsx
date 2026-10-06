import React, { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { api } from "../services/api";
import { ProductCard } from "../components/ProductCard";

export const HomePage = ({ onViewProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = [
    "All Categories",
    "Electronics",
    "Books",
    "Clothing",
    "Home & Kitchen",
    "Accessories",
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts({
        search,
        category: category === "All Categories" ? "" : category,
        sort_by: sortBy,
        min_price: minPrice,
        max_price: maxPrice,
      });
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div>
      {/* Hero Header */}
      <section style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)", color: "white", padding: "4rem 0 3.5rem" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
          <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#c7d2fe", marginBottom: "1rem" }}>
            🛡️ Zero-Trust Multi-Vendor Marketplace
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.2 }}>
            Trade Securely in the Modern Marketplace
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#c7d2fe", marginBottom: "2rem", lineHeight: 1.6 }}>
            Browse curated products, shop with end-to-end authenticated transactions, and manage orders with real-time verification.
          </p>

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search products, equipment, books, apparel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "42px", height: "48px", borderRadius: "var(--radius-md)" }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: "48px", padding: "0 1.5rem" }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Catalog View */}
      <div className="container" style={{ marginTop: "2.5rem" }}>
        {/* Category Pill Filters */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
          {categories.map((cat) => {
            const isSelected = (cat === "All Categories" && !category) || category === cat;
            return (
              <button
                key={cat}
                className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setCategory(cat === "All Categories" ? "" : cat)}
                style={{ borderRadius: "var(--radius-full)", padding: "0.45rem 1rem" }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter & Sorting Controls Toolbar */}
        <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Filter size={15} /> Price Filter:
            </span>
            <input
              type="number"
              className="form-control"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: "95px", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
            />
            <span style={{ color: "var(--text-muted)" }}>-</span>
            <input
              type="number"
              className="form-control"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: "95px", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
            />
            <button className="btn btn-secondary btn-sm" onClick={fetchProducts}>
              Apply
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ArrowUpDown size={15} /> Sort:
            </span>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "170px", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>No products found</h3>
            <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Try adjusting your search criteria or category filter.</p>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                setSearch("");
                setCategory("");
                setMinPrice("");
                setMaxPrice("");
                setSortBy("newest");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-products">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
