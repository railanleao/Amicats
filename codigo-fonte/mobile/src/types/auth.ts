export type AccessType = "Administrator" | "Veterinarian" | "Assistant" | "Viewer";

export interface User {
  id: number;
  fullName: string;
  accessType: AccessType;
  termsAccepted: boolean;
  mustChangePassword: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
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

export function canViewStock(accessType: AccessType): boolean {
  return (
    accessType === 'Administrator' ||
    accessType === 'Assistant' ||
    accessType === 'Veterinarian'
  );
}

export function canManageStock(accessType: AccessType): boolean {
  return accessType === 'Administrator' || accessType === 'Assistant';
}
