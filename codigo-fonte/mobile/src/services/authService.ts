import { apiRequest } from "./api";
import type { LoginCredentials, LoginResponse } from "../types/auth";

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

function createDevResponse(): LoginResponse {
  return {
    token: "dev-token",
    user: {
      id: 0,
      fullName: "Dev User",
      email: DEV_CREDENTIALS.email,
      phone: null,
      photoUrl: null,
      accessType: "ADMIN",
      crmv: null,
      crmvState: null,
      termsAcceptedAt: new Date().toISOString(),
      active: true,
      createdAt: new Date().toISOString(),
    },
  };
}
