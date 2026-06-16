import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const backend_uri = import.meta.env.VITE_BACKEND_URI;
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backend_uri}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${backend_uri}/auth/google`;
  };

  const handleGoogleCallback = async (token) => {
    try {
      if (!token) {
        return {
          success: false,
          message: "No token received",
        };
      }

      localStorage.setItem("token", token);

      await checkAuth();

      return {
        success: true,
      };
    } catch (error) {
      console.error("Google callback error:", error);

      return {
        success: false,
        message: "Google authentication failed",
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch(`${backend_uri}/logout`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        googleLogin,
        handleGoogleCallback,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
