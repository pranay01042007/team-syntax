const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class ApiService {
  getToken() {
    return localStorage.getItem("markethub_token");
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("markethub_token", token);
    } else {
      localStorage.removeItem("markethub_token");
    }
  }

  getHeaders(hasBody = true) {
    const headers = {};
    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.body !== undefined);

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Auto-handle 401 Unauthorized
      if (response.status === 401) {
        if (!endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
          this.setToken(null);
          localStorage.removeItem("markethub_user");
          window.dispatchEvent(new Event("markethub_auth_expired"));
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data?.detail || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Unable to connect to MarketHub server. Please ensure backend is running.");
      }
      throw err;
    }
  }

  // --- Auth APIs ---
  register(payload) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  getMe() {
    return this.request("/auth/me");
  }

  // --- Product APIs ---
  getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.min_price !== undefined && params.min_price !== "") query.append("min_price", params.min_price);
    if (params.max_price !== undefined && params.max_price !== "") query.append("max_price", params.max_price);
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.vendor_id) query.append("vendor_id", params.vendor_id);
    
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return this.request(`/products${queryString}`);
  }

  getProductById(id) {
    return this.request(`/products/${id}`);
  }

  createProduct(payload) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  updateProduct(id, payload) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // --- Cart APIs ---
  getCart() {
    return this.request("/cart");
  }

  addToCart(productId, quantity = 1) {
    return this.request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  removeCartItem(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  }

  clearCart() {
    return this.request("/cart", {
      method: "DELETE",
    });
  }

  // --- Order APIs ---
  checkoutOrder(payload) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  getOrders() {
    return this.request("/orders");
  }

  getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ order_status: status }),
    });
  }

  // --- Vendor APIs ---
  getVendorDashboard() {
    return this.request("/vendor/dashboard");
  }

  getVendorProducts() {
    return this.request("/vendor/products");
  }

  getVendorOrders() {
    return this.request("/vendor/orders");
  }

  getVendorProfile() {
    return this.request("/vendor/profile");
  }

  updateVendorProfile(payload) {
    return this.request("/vendor/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // --- Admin APIs ---
  getAdminDashboard() {
    return this.request("/admin/dashboard");
  }

  getAdminUsers() {
    return this.request("/admin/users");
  }

  toggleUserStatus(userId, isActive) {
    return this.request(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  getAdminVendors() {
    return this.request("/admin/vendors");
  }

  updateAdminVendorStatus(vendorId, status) {
    return this.request(`/admin/vendors/${vendorId}/status?status_name=${status}`, {
      method: "PATCH",
    });
  }

  getAdminProducts() {
    return this.request("/admin/products");
  }

  getAdminOrders() {
    return this.request("/admin/orders");
  }
}

export const api = new ApiService();
