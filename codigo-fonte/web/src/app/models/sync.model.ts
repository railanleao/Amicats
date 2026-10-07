import { AccessType } from './auth.model';

export type SyncDeviceStatus = 'Synchronized' | 'Pending';

export interface SyncDevice {
  deviceId: string;
  deviceName: string | null;
  platform: string | null;
  appVersion: string | null;
  userId: number;
  userName: string;
  accessType: AccessType;
  userActive: boolean;
  pendingCount: number;
  rejectedCount: number;
  lastSyncAt: string | null;
  lastSeenAt: string;
  status: SyncDeviceStatus;
}
