import { useCallback, useEffect, useState } from "react";
import { clearToken, getToken, setToken as persistToken } from "../services/apiClient";
import {
  fetchCurrentUser,
  login as loginRequest,
  signup as signupRequest,
  updateProfile as updateProfileRequest,
} from "../services/authService";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // checking for an existing session on first load
  const [authError, setAuthError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    try {
      const me = await fetchCurrentUser();
      setUser(me);
      setIsAuthenticated(true);
    } catch {
      // Token expired or invalid — treat as logged out rather than erroring the whole app.
      clearToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function signup(name: string, email: string, password: string): Promise<boolean> {
    setAuthError(null);
    try {
      const { accessToken } = await signupRequest(name, email, password);
      persistToken(accessToken);
      await loadUser();
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return false;
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    setAuthError(null);
    try {
      const { accessToken } = await loginRequest(email, password);
      persistToken(accessToken);
      await loadUser();
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return false;
    }
  }

  async function updateProfile(name: string): Promise<boolean> {
    setAuthError(null);
    try {
      const updated = await updateProfileRequest(name);
      setUser(updated);
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Couldn't update your profile. Please try again.");
      return false;
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }

  return { isAuthenticated, isLoading, user, authError, signup, login, logout, updateProfile };
}