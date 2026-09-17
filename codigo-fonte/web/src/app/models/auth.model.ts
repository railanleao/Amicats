export type AccessType = 'Administrator' | 'Veterinarian' | 'Assistant' | 'Viewer';

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
}
