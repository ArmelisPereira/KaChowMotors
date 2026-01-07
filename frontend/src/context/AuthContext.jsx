import { createContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    const loadMe = async () => {
      try {
        if (!token) {
          setUser(null);
          setLoadingAuth(false);
          return;
        }
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (e) {
        setUser(null);
        setToken("");
      } finally {
        setLoadingAuth(false);
      }
    };

    loadMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
