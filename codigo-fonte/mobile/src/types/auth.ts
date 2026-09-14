export type AccessType = "ADMIN" | "VETERINARIAN" | "ASSISTANT" | "VIEWER";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  accessType: AccessType;
  crmv: string | null;
  crmvState: string | null;
  termsAcceptedAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
