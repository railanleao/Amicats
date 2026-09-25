export type AccessType =
  'Administrator' | 'Veterinarian' | 'Assistant' | 'Viewer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  accessType: AccessType;
}

export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  accessType: AccessType;
  termsAccepted: boolean;
  mustChangePassword: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
