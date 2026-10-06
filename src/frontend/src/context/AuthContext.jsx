import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("markethub_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => api.getToken());
  const [loading, setLoading] = useState(true);

  const syncAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    api.setToken(newToken);
    if (newUser) {
      localStorage.setItem("markethub_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("markethub_user");
    }
  };

  useEffect(() => {
    const handleExpired = () => {
      syncAuth(null, null);
    };
    window.addEventListener("markethub_auth_expired", handleExpired);
    return () => window.removeEventListener("markethub_auth_expired", handleExpired);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem("markethub_user", JSON.stringify(profile));
        } catch {
          syncAuth(null, null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    syncAuth(res.access_token, res.user);
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    syncAuth(res.access_token, res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // Ignore failure on logout call
    } finally {
      syncAuth(null, null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      const profile = await api.getMe();
      setUser(profile);
      localStorage.setItem("markethub_user", JSON.stringify(profile));
      return profile;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isCustomer: user?.role === "CUSTOMER",
        isVendor: user?.role === "VENDOR",
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
