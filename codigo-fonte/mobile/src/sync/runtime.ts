import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import type { SqlExecutor } from '../db/sqlExecutor';
import { createCatRepository } from '../repositories/catRepository';
import { getCat as fetchRemoteCat } from '../services/catService';
import { checkOnline } from './connectivity';
import { SyncEngine } from './engine';
import { syncHttpClient } from './http';
import { OutboxService } from './outbox';
import { SyncScheduler } from './scheduler';
import { SyncStore } from './store';
import type { DeviceInfo } from './types';

async function openDatabase(): Promise<SqlExecutor> {
  const db = await SQLite.openDatabaseAsync('amicats.db');
  await db.execAsync('PRAGMA journal_mode = WAL');

  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: (sql, params = []) => db.runAsync(sql, params),
    getAllAsync: <T>(sql: string, params: (string | number | null)[] = []) => db.getAllAsync<T>(sql, params),
    getFirstAsync: <T>(sql: string, params: (string | number | null)[] = []) => db.getFirstAsync<T>(sql, params),
    withTransactionAsync: (task) => db.withTransactionAsync(task),
  };
}

let currentUserId: number | null = null;

export function setSyncUser(userId: number | null): void {
  currentUserId = userId;
}

export const syncStore = new SyncStore(openDatabase);

async function loadDeviceInfo(): Promise<DeviceInfo> {
  let deviceId = await syncStore.run((ops) => ops.getState('device_id'));

  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    const created = deviceId;
    await syncStore.run((ops) => ops.setState('device_id', created));
  }

  return {
    deviceId,
    deviceName: Device.modelName ?? Platform.OS,
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
  };
}

export const syncEngine = new SyncEngine({
  store: syncStore,
  http: syncHttpClient,
  getUserId: () => currentUserId,
  now: () => new Date(),
  deviceInfo: loadDeviceInfo,
});

export const syncScheduler = new SyncScheduler({
  engine: syncEngine,
  checkOnline,
  now: () => Date.now(),
  random: Math.random,
});

export const outboxService = new OutboxService({
  uuid: () => Crypto.randomUUID(),
  now: () => new Date(),
  onEnqueued: () => {
    syncEngine.notifyChanged();
    void syncScheduler.request('enqueue');
  },
});

export const catRepository = createCatRepository({
  store: syncStore,
  outbox: outboxService,
  now: () => new Date(),
  fetchRemoteCat,
});
