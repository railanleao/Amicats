export type OperationType = 'CREATE_CAT' | 'UPLOAD_CAT_PHOTO' | 'CREATE_STOCK_ENTRY' | 'CREATE_INTERNAL_PRESCRIPTION';

export type OutboxStatus = 'pending' | 'rejected';

export interface OutboxItem {
  seq: number;
  id: string;
  type: OperationType;
  authorUserId: number;
  payload: unknown;
  recordedAt: string;
  status: OutboxStatus;
  attempts: number;
  serverErrors: number;
  lastError: string | null;
  lastStatus: number | null;
  createdAt: string;
}

export interface MultipartFile {
  fieldName: string;
  uri: string;
  name: string;
  type: string;
}

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  multipart?: MultipartFile;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<T>;
}

export type EntityName = 'cat' | 'room' | 'stock_item' | 'prescribed_medication';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion: string;
}

export interface PullResponse {
  cursor: string | null;
  cats: { id: number }[];
  rooms: { id: number }[];
  stockItems: { id: number }[];
  prescribedMedications: { id: number }[];
}

export type BlockedBy = 'network' | 'unauthorized' | 'server' | null;

export interface SyncResult {
  skipped: boolean;
  pushed: number;
  rejected: number;
  pulled: boolean;
  blockedBy: BlockedBy;
}

export interface SyncCounts {
  pending: number;
  rejected: number;
}

export interface SyncSnapshot extends SyncCounts {
  syncing: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
}
