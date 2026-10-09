// Pulled out of TransferRoomScreen.tsx so it can be unit tested with the plain Node test runner
// (node:test via tsx) — the mobile project has no component-rendering test setup, and the screen
// file itself can't be imported directly from a Node test because it pulls in 'react-native'.
// For the same reason this avoids importing ApiError from services/api.ts (that file pulls in
// 'react-native' too, via storage/authStorage.ts) and duck-types it instead.
function isApiError(error: unknown): error is { status?: number; message: string } {
  return error instanceof Error && 'status' in error;
}

export interface RoomOption {
  id: number;
  title: string;
  occupied: number;
  capacity: number | null;
}

export function occupancySubtitle(option: RoomOption): string {
  return option.capacity != null
    ? `${option.occupied}/${option.capacity} ocupada`
    : `${option.occupied} ${option.occupied === 1 ? 'gato' : 'gatos'}`;
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
