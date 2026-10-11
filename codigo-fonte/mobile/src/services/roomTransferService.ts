import { apiRequest } from './api';
import type { Cat } from '../types/cat';
import type { RoomTransfer } from '../types/roomTransfer';

interface CreateRoomTransferRequest {
  roomId: number;
  reason: string;
}

// Returns the updated cat (new roomId/roomTitle already applied), same as updateCat, so the
// caller can cache it the same way.
export function createRoomTransfer(catId: number, request: CreateRoomTransferRequest): Promise<Cat> {
  return apiRequest<Cat>(`/cats/${catId}/room-transfers`, { method: 'POST', body: request });
}

// Ordered most-recent-first by the backend.
export function listRoomTransfers(catId: number): Promise<RoomTransfer[]> {
  return apiRequest<RoomTransfer[]>(`/cats/${catId}/room-transfers`);
}
