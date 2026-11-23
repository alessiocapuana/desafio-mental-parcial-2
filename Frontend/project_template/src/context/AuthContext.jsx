import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function recoverSession() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await api.getProfile();
        setUser(profile.user || profile);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    recoverSession();
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem("token", data.token);
    const profile = await api.getProfile();
    const userData = profile.user || profile;
    setUser(userData);
    return userData;
  }

  async function register(name, email, password) {
    return await api.register({ name, email, password });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}