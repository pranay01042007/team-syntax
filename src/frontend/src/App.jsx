import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { VendorDashboard } from "./pages/VendorDashboard";
import { VendorProductsPage } from "./pages/VendorProductsPage";
import { VendorOrdersPage } from "./pages/VendorOrdersPage";
import { VendorProfilePage } from "./pages/VendorProfilePage";
import { VendorProductModal } from "./pages/VendorProductModal";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { api } from "./services/api";

const MainApp = () => {
  const { user, isAuthenticated, isCustomer, isVendor, isAdmin } = useAuth();

  // Navigation router state
  const [currentView, setCurrentView] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Vendor create modal shortcut state
  const [vendorCreateOpen, setVendorCreateOpen] = useState(false);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView("product-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setCurrentView("order-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderPlaced = (order) => {
    setSelectedOrder(order);
    setCurrentView("order-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (loggedInUser) => {
    if (loggedInUser.role === "ADMIN") {
      setCurrentView("admin");
    } else if (loggedInUser.role === "VENDOR") {
      setCurrentView("vendor");
    } else {
      setCurrentView("home");
    }
  };

  const handleRegisterSuccess = (registeredUser) => {
    if (registeredUser.role === "VENDOR") {
      setCurrentView("vendor");
    } else {
      setCurrentView("home");
    }
  };

  const handleSaveNewProduct = async (productData) => {
    await api.createProduct(productData);
    setVendorCreateOpen(false);
    setCurrentView("vendor-products");
  };

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-content">
        {/* Public & Customer Flow */}
        {currentView === "home" && (
          <HomePage onViewProduct={handleViewProduct} />
        )}

        {currentView === "product-details" && (
          <ProductDetailsPage
            product={selectedProduct}
            onBack={() => setCurrentView("home")}
            onNavigateCart={() => setCurrentView("cart")}
            onNavigateLogin={() => setCurrentView("login")}
          />
        )}

        {currentView === "cart" && (
          <CartPage
            onCheckout={() => setCurrentView("checkout")}
            onContinueShopping={() => setCurrentView("home")}
            onNavigateLogin={() => setCurrentView("login")}
          />
        )}

        {currentView === "checkout" && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onBackToCart={() => setCurrentView("cart")}
          />
        )}

        {currentView === "customer" && (
          <CustomerDashboard
            onNavigateOrders={() => setCurrentView("orders")}
            onNavigateCart={() => setCurrentView("cart")}
            onStartShopping={() => setCurrentView("home")}
            onSelectOrder={handleSelectOrder}
          />
        )}

        {currentView === "orders" && (
          <OrdersPage
            onSelectOrder={handleSelectOrder}
            onStartShopping={() => setCurrentView("home")}
          />
        )}

        {currentView === "order-details" && (
          <OrderDetailsPage
            order={selectedOrder}
            onBack={() => setCurrentView(isVendor ? "vendor-orders" : "orders")}
          />
        )}

        {/* Vendor Flow */}
        {currentView === "vendor" && (
          <VendorDashboard
            onNavigateProducts={() => setCurrentView("vendor-products")}
            onNavigateOrders={() => setCurrentView("vendor-orders")}
            onNavigateProfile={() => setCurrentView("vendor-profile")}
            onOpenCreateModal={() => setVendorCreateOpen(true)}
          />
        )}

        {currentView === "vendor-products" && (
          <VendorProductsPage />
        )}

        {currentView === "vendor-orders" && (
          <VendorOrdersPage />
        )}

        {currentView === "vendor-profile" && (
          <VendorProfilePage />
        )}

        {/* Admin Flow */}
        {currentView === "admin" && (
          <AdminDashboard />
        )}

        {/* Auth & Identity */}
        {currentView === "login" && (
          <LoginPage
            onNavigateRegister={() => setCurrentView("register")}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === "register" && (
          <RegisterPage
            onNavigateLogin={() => setCurrentView("login")}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {currentView === "profile" && (
          <ProfilePage />
        )}
      </main>

      <Footer />

      {/* Global Vendor Product Creation Modal */}
      <VendorProductModal
        isOpen={vendorCreateOpen}
        onClose={() => setVendorCreateOpen(false)}
        onSave={handleSaveNewProduct}
        product={null}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
