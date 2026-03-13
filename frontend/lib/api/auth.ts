import { get, post } from "./client";
import type { AuthResponse } from "@/lib/types/auth";

export function signUp(email: string, password: string): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/signup", { email, password });
}

export function logIn(email: string, password: string): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/login", { email, password });
}

export function getMe() {
  return get<AuthResponse["user"]>("/auth/me");
}
