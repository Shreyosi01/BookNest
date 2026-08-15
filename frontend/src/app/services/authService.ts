import { api } from "./apiClient";
import type { User } from "../types";

interface TokenResponse {
  accessToken: string;
  tokenType: string;
}

export function signup(name: string, email: string, password: string) {
  return api.post<TokenResponse>("/auth/signup", { name, email, password });
}

export function login(email: string, password: string) {
  return api.post<TokenResponse>("/auth/login", { email, password });
}

export function fetchCurrentUser() {
  return api.get<User>("/auth/me");
}