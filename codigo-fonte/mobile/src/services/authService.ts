import { apiRequest } from "./api";
import type {
  ChangePasswordRequest,
  LoginCredentials,
  LoginResponse,
} from "../types/auth";

// Fake login to test the app without the real authentication backend.
// TODO: remove once the real endpoint (`POST /auth/login`) is available.
export const DEV_CREDENTIALS: LoginCredentials = {
  email: "dev@amicats.org.br",
  password: "dev123",
};

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  if (
    __DEV__ &&
    credentials.email === DEV_CREDENTIALS.email &&
    credentials.password === DEV_CREDENTIALS.password
  ) {
    return Promise.resolve(createDevResponse());
  }

  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function acceptTerms(): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/accept-terms", { method: "POST" });
}

export function changePassword(
  request: ChangePasswordRequest,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/change-password", {
    method: "PATCH",
    body: request,
  });
}

function createDevResponse(): LoginResponse {
  return {
    token: "dev-token",
    id: 0,
    name: "Dev User",
    accessType: "Administrator",
    termsAccepted: true,
    mustChangePassword: false,
  };
}
