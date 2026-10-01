import { apiRequest } from './api';
import type { PagedResult } from '../types/common';
import type { Room } from '../types/room';

// GET /rooms is Administrator-only today (RoomControllerImpl), so this call
// fails with 403 for other roles even though room assignment (RF-005) is
// also expected for the Médico-Veterinário. Callers should show that error
// instead of crashing.
export async function listActiveRooms(): Promise<Room[]> {
  const result = await apiRequest<PagedResult<Room>>('/rooms?active=true&size=100');
  return result.content;
}
