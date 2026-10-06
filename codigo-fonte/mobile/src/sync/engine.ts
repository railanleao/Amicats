import { OPERATIONS, UnresolvedReferenceError } from './operations';
import type { OperationDefinition } from './operations';
import type { StoreOps, SyncStore } from './store';
import type { BlockedBy, DeviceInfo, HttpClient, OutboxItem, PullResponse, SyncResult, SyncSnapshot } from './types';

const TRANSIENT_STATUSES = new Set([408, 425, 429]);
const MAX_CONSECUTIVE_SERVER_ERRORS = 5;
const STALE_RUN_MS = 90_000;
const MAX_CONSECUTIVE_FAILURES_PER_RUN = 2;

export interface SyncEngineDeps {
  store: SyncStore;
  http: HttpClient;
  getUserId: () => number | null;
  now: () => Date;
  deviceInfo: () => Promise<DeviceInfo>;
}

type Listener = () => void;

export class SyncEngine {
  private running: Promise<SyncResult> | null = null;
  private runStartedAt = 0;
  private listeners = new Set<Listener>();
  private lastError: string | null = null;
  private lastSyncAt: string | null = null;

  constructor(private readonly deps: SyncEngineDeps) {}

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyChanged(): void {
    this.listeners.forEach((listener) => listener());
  }

  async snapshot(): Promise<SyncSnapshot> {
    const userId = this.deps.getUserId();
    const counts = userId === null ? { pending: 0, rejected: 0 } : await this.counts(userId);

    return {
      ...counts,
      syncing: this.running !== null,
      lastSyncAt: this.lastSyncAt ?? (await this.deps.store.run((ops) => ops.getState('last_sync_at'))),
      lastError: this.lastError,
    };
  }

  syncNow(): Promise<SyncResult> {
    if (this.running && this.deps.now().getTime() - this.runStartedAt < STALE_RUN_MS) {
      return this.running;
    }

    this.runStartedAt = this.deps.now().getTime();

    const execution: Promise<SyncResult> = this.withWatchdog(this.execute()).finally(() => {
      if (this.running === execution) {
        this.running = null;
      }
      this.notifyChanged();
    });

    this.running = execution;
    this.notifyChanged();

    return execution;
  }

  private withWatchdog(run: Promise<SyncResult>): Promise<SyncResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<SyncResult>((resolve) => {
      timer = setTimeout(() => {
        this.lastError = `A sincronização não terminou em ${STALE_RUN_MS / 1000}s e foi interrompida.`;
        resolve({ skipped: false, pushed: 0, rejected: 0, pulled: false, blockedBy: 'network' });
      }, STALE_RUN_MS);
    });

    (timer as unknown as { unref?: () => void }).unref?.();

    return Promise.race([run, timeout]).finally(() => clearTimeout(timer));
  }

  private async execute(): Promise<SyncResult> {
    const userId = this.deps.getUserId();

    if (userId === null) {
      return { skipped: true, pushed: 0, rejected: 0, pulled: false, blockedBy: null };
    }

    const push = await this.push(userId);
    let pulled = false;
    let blockedBy = push.blockedBy;

    if (blockedBy === null || blockedBy === 'server') {
      const pull = await this.pull();
      pulled = pull.ok;
      blockedBy = blockedBy ?? pull.blockedBy;
    }

    if (blockedBy === null) {
      this.lastSyncAt = this.deps.now().toISOString();
      this.lastError = null;
      await this.deps.store.run((ops) => ops.setState('last_sync_at', this.lastSyncAt as string));
    }

    if (blockedBy !== 'network' && blockedBy !== 'unauthorized') {
      await this.sendHeartbeat(userId);
    }

    return { skipped: false, pushed: push.pushed, rejected: push.rejected, pulled, blockedBy };
  }

  private async push(userId: number): Promise<{ pushed: number; rejected: number; blockedBy: BlockedBy }> {
    let pushed = 0;
    let rejected = 0;
    let consecutiveFailures = 0;
    let lastFailure: BlockedBy = null;
    const skipped: string[] = [];

    for (;;) {
      const item = await this.deps.store.run((ops) => ops.nextPending(userId, skipped));

      if (!item) {
        break;
      }

      const outcome = await this.send(item);

      if (outcome === 'sent' || outcome === 'rejected') {
        consecutiveFailures = 0;
        pushed += outcome === 'sent' ? 1 : 0;
        rejected += outcome === 'rejected' ? 1 : 0;
        this.notifyChanged();
        continue;
      }

      if (outcome === 'deferred') {
        skipped.push(item.id);
        continue;
      }

      this.notifyChanged();

      if (outcome === 'unauthorized') {
        return { pushed, rejected, blockedBy: outcome };
      }

      skipped.push(item.id);
      consecutiveFailures += 1;
      lastFailure = outcome;

      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES_PER_RUN) {
        return { pushed, rejected, blockedBy: outcome };
      }
    }

    if (lastFailure === null) {
      return { pushed, rejected, blockedBy: null };
    }

    return { pushed, rejected, blockedBy: pushed + rejected === 0 ? lastFailure : 'server' };
  }

  private async send(item: OutboxItem): Promise<'sent' | 'rejected' | 'deferred' | Exclude<BlockedBy, null>> {
    const definition = OPERATIONS[item.type] as OperationDefinition<unknown>;
    const resolveId = async (reference: number): Promise<number> => {
      if (reference >= 0) {
        return reference;
      }

      const serverId = await this.deps.store.run((ops) => ops.resolveId(reference));

      if (serverId === null) {
        throw new UnresolvedReferenceError(reference);
      }

      return serverId;
    };

    try {
      const request = await definition.build(item.payload, resolveId);
      const response = await this.deps.http.request<unknown>({
        ...request,
        headers: { ...request.headers, 'Idempotency-Key': item.id },
      });

      await this.deps.store.transaction(async (ops) => {
        await definition.onSuccess?.(item.payload, response, ops);
        await ops.deleteOutbox(item.id);
      });

      return 'sent';
    } catch (error) {
      return this.handleFailure(item, error);
    }
  }

  private async handleFailure(item: OutboxItem, error: unknown): Promise<'rejected' | 'deferred' | Exclude<BlockedBy, null>> {
    const message = error instanceof Error ? error.message : 'Falha desconhecida.';
    const status = hasStatus(error) ? (error.status ?? null) : null;

    if (error instanceof UnresolvedReferenceError) {
      const parentStillPending = await this.deps.store.run((ops) => ops.hasPendingCreateCat(item.authorUserId, error.reference));

      if (parentStillPending) {
        return 'deferred';
      }

      await this.reject(item, message, null);
      return 'rejected';
    }

    if (status === null) {
      await this.deps.store.run((ops) => ops.markAttempt(item.id, message, null));
      this.lastError = message;
      return 'network';
    }

    if (status === 401) {
      this.lastError = message;
      return 'unauthorized';
    }

    if (status === 500 && item.serverErrors + 1 >= MAX_CONSECUTIVE_SERVER_ERRORS) {
      await this.reject(
        item,
        `O servidor não conseguiu processar este registro (erro 500) após ${MAX_CONSECUTIVE_SERVER_ERRORS} tentativas.`,
        status,
      );
      return 'rejected';
    }

    if (status >= 500 || TRANSIENT_STATUSES.has(status)) {
      await this.deps.store.run((ops) => ops.markAttempt(item.id, message, status));
      this.lastError = message;
      return 'server';
    }

    await this.reject(item, message, status);
    return 'rejected';
  }

  private async reject(item: OutboxItem, message: string, status: number | null): Promise<void> {
    await this.deps.store.run((ops) => ops.markRejected(item.id, message, status));
  }

  private async pull(): Promise<{ ok: boolean; blockedBy: BlockedBy }> {
    try {
      const since = await this.deps.store.run((ops) => ops.getState('cursor'));
      const path = since ? `/sync/pull?since=${encodeURIComponent(since)}` : '/sync/pull';
      const changes = await this.deps.http.request<PullResponse>({ method: 'GET', path });

      await this.deps.store.transaction(async (ops) => {
        await applyChanges(ops, changes);
      });

      return { ok: true, blockedBy: null };
    } catch (error) {
      const status = hasStatus(error) ? (error.status ?? null) : null;
      this.lastError = error instanceof Error ? error.message : 'Falha desconhecida.';

      if (status === null) {
        return { ok: false, blockedBy: 'network' };
      }

      return { ok: false, blockedBy: status === 401 ? 'unauthorized' : 'server' };
    }
  }

  private async sendHeartbeat(userId: number): Promise<void> {
    try {
      const device = await this.deps.deviceInfo();
      const counts = await this.counts(userId);

      await this.deps.http.request<void>({
        method: 'POST',
        path: '/sync/heartbeat',
        body: {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          platform: device.platform,
          appVersion: device.appVersion,
          pendingCount: counts.pending,
          rejectedCount: counts.rejected,
          lastSyncAt: this.lastSyncAt ? toLocalDateTime(new Date(this.lastSyncAt)) : null,
        },
      });
    } catch {
      return;
    }
  }

  private counts(userId: number) {
    return this.deps.store.run((ops) => ops.counts(userId));
  }
}

async function applyChanges(ops: StoreOps, changes: PullResponse): Promise<void> {
  for (const cat of changes.cats) {
    await ops.upsertEntity('cat', cat.id, cat);
  }
  for (const room of changes.rooms) {
    await ops.upsertEntity('room', room.id, room);
  }
  for (const item of changes.stockItems) {
    await ops.upsertEntity('stock_item', item.id, item);
  }
  for (const medication of changes.prescribedMedications) {
    await ops.upsertEntity('prescribed_medication', medication.id, medication);
  }
  if (changes.cursor) {
    await ops.setState('cursor', changes.cursor);
  }
}

function hasStatus(error: unknown): error is { status?: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export function toLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
