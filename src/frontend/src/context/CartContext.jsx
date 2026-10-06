import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({ items: [], total_amount: 0, item_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ items: [], total_amount: 0, item_count: 0 });
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch {
      setCart({ items: [], total_amount: 0, item_count: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const updated = await api.addToCart(productId, quantity);
    setCart(updated);
    return updated;
  };

  const updateQuantity = async (itemId, quantity) => {
    const updated = await api.updateCartItem(itemId, quantity);
    setCart(updated);
    return updated;
  };

  const removeItem = async (itemId) => {
    const updated = await api.removeCartItem(itemId);
    setCart(updated);
    return updated;
  };

  const clearCart = async () => {
    await api.clearCart();
    setCart({ items: [], total_amount: 0, item_count: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount: cart.item_count || 0,
        totalAmount: cart.total_amount || 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
