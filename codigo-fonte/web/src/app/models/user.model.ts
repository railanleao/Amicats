import { AccessType } from './auth.model';

export const ACCESS_TYPE_LABELS: Record<AccessType, string> = {
  Administrator: 'Administrador',
  Veterinarian: 'Veterinário',
  Assistant: 'Assistente',
  Viewer: 'Visualizador',
};

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  imageUrl: string | null;
  accessType: AccessType;
  crmv: string | null;
  ufCrmv: string | null;
  active: boolean;
  createdAt: string;
}

export interface UserSearchParams {
  search?: string;
  accessType?: AccessType;
  active?: boolean;
  page: number;
  size: number;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
