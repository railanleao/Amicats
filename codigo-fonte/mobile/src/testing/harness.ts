import { createCatRepository } from '../repositories/catRepository';
import { SyncEngine } from '../sync/engine';
import { OutboxService } from '../sync/outbox';
import { SyncStore } from '../sync/store';
import type { DeviceInfo, HttpClient, HttpRequest } from '../sync/types';
import { createNodeSqliteExecutor } from './nodeSqliteExecutor';

export type Handler = (request: HttpRequest, calls: HttpRequest[]) => unknown | Promise<unknown>;

export class FakeHttp implements HttpClient {
  readonly calls: HttpRequest[] = [];

  constructor(public handler: Handler) {}

  async request<T>(request: HttpRequest): Promise<T> {
    this.calls.push(request);
    return (await this.handler(request, this.calls)) as T;
  }

  to(method: string, path: string): HttpRequest[] {
    return this.calls.filter((call) => call.method === method && call.path.startsWith(path));
  }
}

export interface Harness {
  store: SyncStore;
  http: FakeHttp;
  engine: SyncEngine;
  outbox: OutboxService;
  catRepository: ReturnType<typeof createCatRepository>;
  enqueued: { count: number };
  setUser: (userId: number | null) => void;
  advance: (ms: number) => void;
}

export const DEVICE: DeviceInfo = {
  deviceId: 'device-test',
  deviceName: 'Galaxy',
  platform: 'android',
  appVersion: '1.0.0',
};

export function emptyPull(cursor: string | null = null) {
  return { cursor, cats: [], rooms: [], stockItems: [], prescribedMedications: [] };
}

export function serverCat(id: number, name: string, extra: object = {}) {
  return {
    id,
    name,
    roomId: null,
    roomTitle: null,
    sex: null,
    estimatedBirthDate: null,
    coat: null,
    weightKg: null,
    characteristics: null,
    generalStatus: 'InTriage',
    microchip: null,
    rescueDate: null,
    foundConditions: null,
    sponsorName: null,
    sponsorPhone: null,
    sponsorFunding: null,
    photoUrl: null,
    healthStatus: 'NotTested',
    pifResult: 'NotTested',
    neuteringStatus: null,
    createdAt: '2026-10-03T10:00:00',
    ...extra,
  };
}

export function createHarness(handler?: Handler): Harness {
  let userId: number | null = 1;
  let nowMs = Date.parse('2026-10-03T12:00:00Z');
  let counter = 0;
  const enqueued = { count: 0 };

  const defaultHandler: Handler = (request) => {
    if (request.method === 'GET' && request.path.startsWith('/sync/pull')) {
      return emptyPull();
    }
    if (request.path === '/sync/heartbeat') {
      return undefined;
    }
    throw new Error(`Unexpected request ${request.method} ${request.path}`);
  };

  const store = new SyncStore(async () => createNodeSqliteExecutor());
  const http = new FakeHttp(handler ?? defaultHandler);
  const now = () => new Date(nowMs);

  const engine = new SyncEngine({
    store,
    http,
    getUserId: () => userId,
    now,
    deviceInfo: async () => DEVICE,
  });

  const outbox = new OutboxService({
    uuid: () => `op-${(counter += 1)}`,
    now,
    onEnqueued: () => {
      enqueued.count += 1;
    },
  });

  const catRepository = createCatRepository({
    store,
    outbox,
    now,
    fetchRemoteCat: async () => {
      throw new Error('remote fetch not expected');
    },
  });

  return {
    store,
    http,
    engine,
    outbox,
    catRepository,
    enqueued,
    setUser: (next) => {
      userId = next;
    },
    advance: (ms) => {
      nowMs += ms;
    },
  };
}

export const CAT_REQUEST = {
  name: 'Nina',
  roomId: null,
  sex: null,
  estimatedBirthDate: null,
  coat: null,
  weightKg: null,
  characteristics: null,
  generalStatus: null,
  microchip: null,
  rescueDate: null,
  foundConditions: null,
  sponsorName: null,
  sponsorPhone: null,
  sponsorFunding: null,
};
