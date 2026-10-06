import React from "react";
import { ShoppingBag, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Shield, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, isCustomer, isVendor, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logout();
    setCurrentView("home");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <div
          className="brand"
          style={{ cursor: "pointer" }}
          onClick={() => setCurrentView("home")}
        >
          <div className="brand-icon">
            <ShoppingBag size={18} />
          </div>
          <span>MarketHub</span>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <button
            className={`btn btn-outline btn-sm ${currentView === "home" ? "active" : ""}`}
            style={{ border: "none" }}
            onClick={() => setCurrentView("home")}
          >
            Marketplace
          </button>

          {isAuthenticated && isCustomer && (
            <>
              <button
                className={`btn btn-outline btn-sm ${currentView === "customer" ? "active" : ""}`}
                style={{ border: "none" }}
                onClick={() => setCurrentView("customer")}
              >
                Dashboard
              </button>
              <button
                className={`btn btn-outline btn-sm ${currentView === "orders" ? "active" : ""}`}
                style={{ border: "none" }}
                onClick={() => setCurrentView("orders")}
              >
                My Orders
              </button>
            </>
          )}

          {isAuthenticated && isVendor && (
            <>
              <button
                className={`btn btn-outline btn-sm ${currentView === "vendor" ? "active" : ""}`}
                style={{ border: "none" }}
                onClick={() => setCurrentView("vendor")}
              >
                <Store size={15} /> Vendor Hub
              </button>
              <button
                className={`btn btn-outline btn-sm ${currentView === "vendor-products" ? "active" : ""}`}
                style={{ border: "none" }}
                onClick={() => setCurrentView("vendor-products")}
              >
                Products
              </button>
              <button
                className={`btn btn-outline btn-sm ${currentView === "vendor-orders" ? "active" : ""}`}
                style={{ border: "none" }}
                onClick={() => setCurrentView("vendor-orders")}
              >
                Orders
              </button>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <button
                className={`btn btn-outline btn-sm ${currentView === "admin" ? "active" : ""}`}
                style={{ border: "none", color: "#6366f1", fontWeight: 700 }}
                onClick={() => setCurrentView("admin")}
              >
                <Shield size={15} /> Admin Portal
              </button>
            </>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="nav-actions">
          {(!isAuthenticated || isCustomer) && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ position: "relative" }}
              onClick={() => setCurrentView("cart")}
              title="Shopping Cart"
            >
              <ShoppingCart size={17} />
              <span>Cart</span>
              {itemCount > 0 && (
                <span
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "white",
                    borderRadius: "999px",
                    padding: "0.15rem 0.45rem",
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    marginLeft: "0.25rem",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentView("profile")}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <UserIcon size={15} />
                <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </span>
                <span
                  className="badge"
                  style={{
                    fontSize: "0.65rem",
                    padding: "0.1rem 0.4rem",
                    backgroundColor:
                      user.role === "ADMIN"
                        ? "#fef2f2"
                        : user.role === "VENDOR"
                        ? "#f0fdf4"
                        : "#e0e7ff",
                    color:
                      user.role === "ADMIN"
                        ? "#b91c1c"
                        : user.role === "VENDOR"
                        ? "#15803d"
                        : "#4338ca",
                  }}
                >
                  {user.role}
                </span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentView("login")}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentView("register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
