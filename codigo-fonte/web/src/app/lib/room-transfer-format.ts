import { RoomTransfer } from '../models/room-transfer.model';
import { parseServerDateTime } from './server-date';

export function transferDateTimeLabel(transfer: RoomTransfer): string {
  const date = parseServerDateTime(transfer.createdAt);
  const datePart = new Intl.DateTimeFormat('pt-BR').format(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${datePart} às ${timePart}`;
}

// The oldest entry in a cat's history has no fromRoom — it's the room it was first assigned
// to, not a transfer from somewhere else.
export function transferFromLabel(transfer: RoomTransfer): string {
  return transfer.fromRoomTitle ?? 'Cadastro inicial';
}
