export interface Room {
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  maxCapacity: number | null;
  active: boolean;
}

export interface RoomSearchParams {
  search?: string;
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
