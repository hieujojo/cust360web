"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/models";
import { setAuthToken, removeAuthToken } from "@/lib/api/client";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

    const loadUser = () => {
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
    };

    loadUser();
    setIsLoading(false);

    if (typeof window !== "undefined") {
      window.addEventListener("user-updated", loadUser);
      return () => window.removeEventListener("user-updated", loadUser);
    }
  }, []);

  const updateUser = (updatedFields: Partial<User>) => {
    if (typeof window !== "undefined" && user) {
      const newUser = { ...user, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      window.dispatchEvent(new Event("user-updated"));
    }
  };

  const login = async (user: User, token: string, firebaseToken: string) => {
    if (typeof window !== "undefined") {
       const userWithLogin = {
            ...user,
            lastLoginAt: new Date().toISOString(),
        };
      localStorage.setItem("user", JSON.stringify(userWithLogin));
      localStorage.setItem("accessToken", token);
      setUser(userWithLogin);

      setAuthToken(token);

      // Set cookie for middleware
      document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60}`;
      await signInWithCustomToken(auth, firebaseToken);
    }
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      document.cookie = "accessToken=; path=/; max-age=0";
      removeAuthToken();
      setUser(null);
      await signOut(auth);
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
    updateUser,
    hasRole,
  };
}
