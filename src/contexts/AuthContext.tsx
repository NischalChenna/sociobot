import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI, RegisterData } from "../utils/api";

interface User {
  id: string;
  email: string;
  businessProfile: {
    name: string;
    description: string;
    industry: string;
    logo?: string;
    timezone: string;
  };
  subscription: {
    plan: string;
    postsRemaining: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Token is set in api.ts interceptors
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      const { token: newToken, user: userData } = data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await authAPI.register(userData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
