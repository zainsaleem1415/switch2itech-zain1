/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../api/authService";

export const userContext = createContext();

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.data && (response.data.status === "success" || response.data.user)) {
          const userData = response.data.data?.user || response.data.data || response.data.user;
          setUser(userData);
          setRole(userData?.role || 'user');
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) { console.error(error);
        setAuthenticated(false);
        setRole(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <userContext.Provider value={{ user, role, authenticated, loading, setAuthenticated, setUser, setRole }}>
      {children}
    </userContext.Provider>
  );
};

export const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const { role, authenticated, loading } = useAuth();

  if (loading) return null;

  if (!authenticated || !allowedRoles.includes(role)) {
    return fallback;
  }

  return <>{children}</>;
};

export const useAuth = () => {
  const context = useContext(userContext);

  if (!context) {
    throw new Error("useAuth must be used within a ContextProvider");
  }

  return context;
};

export default ContextProvider;