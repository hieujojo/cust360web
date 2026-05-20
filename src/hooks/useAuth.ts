"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/models";
import { setAuthToken, removeAuthToken } from "@/lib/api/client";

/**
 * Custom hook for authentication
 * Manages user state and token in localStorage
 */
export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Load user from localStorage on mount (client-side only)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          setAuthToken(token);
        } catch (error) {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", token);
      setUser(user);

      setAuthToken(token);

      // Set cookie for middleware
      document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60}`; // 1 hour
    }
  };

  const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    removeAuthToken();
    setUser(null);
    router.push("/login"); // ✅ Dùng Next.js router, không reload
  }
};

  const isAuthenticated = !!user;

  const hasRole = (roles: number[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isMounted,
    login,
    logout,
    hasRole,
  };
}
