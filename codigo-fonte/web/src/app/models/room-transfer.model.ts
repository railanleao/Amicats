// Mirrors the backend's ReadRoomTransferOutput (org.amicats.backend.domain.usecase.roomtransfer).
export interface RoomTransfer {
  id: number;
  catId: number;
  fromRoomId: number | null;
  fromRoomTitle: string | null;
  toRoomId: number;
  toRoomTitle: string;
  reason: string;
  createdAt: string;
}

export interface CreateRoomTransferRequest {
  roomId: number;
  reason: string;
}
