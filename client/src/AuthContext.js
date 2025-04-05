import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/me`,
          {
            method: "GET",
            headers: { "x-auth-token": token },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setUser(data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        setToken(null);
      }

      setLoading(false);
    };

    loadUser();
  }, [token]);

  const register = async (email, password) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        return { success: true };
      } else {
        return { success: false, message: data.msg };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);

        const userResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/me`,
          {
            headers: { "x-auth-token": data.token },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
        }

        return { success: true };
      } else {
        return { success: false, message: data.msg };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        register,
        login,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
