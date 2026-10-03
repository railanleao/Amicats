import { apiRequest } from './api';
import type { PagedResult } from '../types/common';
import type { Room } from '../types/room';

export async function listActiveRooms(): Promise<Room[]> {
  const result = await apiRequest<PagedResult<Room>>('/rooms?active=true&size=100');
  return result.content;
}

export async function searchRooms(term: string): Promise<Room[]> {
  const query = new URLSearchParams({ search: term, page: '0', size: '50' });
  const result = await apiRequest<PagedResult<Room>>(`/rooms?${query.toString()}`);
  return result.content;
}
