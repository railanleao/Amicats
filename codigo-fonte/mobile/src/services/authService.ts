import { apiRequest } from "./api";
import type { LoginCredentials, LoginResponse } from "../types/auth";

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}
