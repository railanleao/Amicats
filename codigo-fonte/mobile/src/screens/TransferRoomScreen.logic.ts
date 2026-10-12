// Pulled out of TransferRoomScreen.tsx so it can be unit tested with the plain Node test runner
// (node:test via tsx) — the mobile project has no component-rendering test setup, and the screen
// file itself can't be imported directly from a Node test because it pulls in 'react-native'.
// For the same reason this avoids importing ApiError from services/api.ts (that file pulls in
// 'react-native' too, via storage/authStorage.ts) and duck-types it instead, and reimplements the
// server-datetime parsing (see utils/healthProcedure.ts's formatChangedAt) rather than importing
// it, since that module pulls in RN-dependent sibling imports too.
import type { RoomTransfer } from '../types/roomTransfer';

function isApiError(error: unknown): error is { status?: number; message: string } {
  return error instanceof Error && 'status' in error;
}

export interface RoomOption {
  id: number;
  title: string;
  occupied: number;
  capacity: number | null;
}

export interface CurrentRoomInfo {
  title: string;
  description: string | null;
  occupied: number;
  capacity: number | null;
}

export function occupancySubtitle(option: Pick<RoomOption, 'occupied' | 'capacity'>): string {
  return option.capacity != null
    ? `${option.occupied}/${option.capacity} ocupada`
    : `${option.occupied} ${option.occupied === 1 ? 'gato' : 'gatos'}`;
}

export function currentRoomSubtitle(info: CurrentRoomInfo): string {
  const parts = [occupancySubtitle(info)];
  if (info.description) {
    parts.push(info.description);
  }
  return parts.join(' · ');
}

const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;

export function transferDateTimeLabel(transfer: RoomTransfer): string {
  const date = new Date(HAS_OFFSET.test(transfer.createdAt) ? transfer.createdAt : `${transfer.createdAt}Z`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} às ${hours}:${minutes}`;
}

// The oldest entry in a cat's history has no fromRoom — it's the room it was first assigned to,
// not a transfer from somewhere else.
export function transferFromLabel(transfer: RoomTransfer): string {
  return transfer.fromRoomTitle ?? 'Cadastro inicial';
}

// 400 here is always a specific business-rule violation (same room, sala lotada) with a message
// worth showing as-is; 403 gets a fixed message since the backend doesn't send one for it.
export function transferErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403) {
      return 'Você não tem permissão para transferir gatinhos de sala.';
    }
    if (error.status === 400) {
      return error.message;
    }
  }
  return 'Não foi possível transferir o gato.';
}

export function canSubmitTransfer(selectedRoomId: number | null, reason: string): boolean {
  return selectedRoomId !== null && reason.trim().length > 0;
}
