import { runMigrations } from '../db/migrations';
import type { SqlExecutor } from '../db/sqlExecutor';
import type { EntityName, OperationType, OutboxItem, OutboxStatus, SyncCounts } from './types';

interface OutboxRow {
  seq: number;
  id: string;
  type: OperationType;
  author_user_id: number;
  payload: string;
  recorded_at: string;
  status: OutboxStatus;
  attempts: number;
  server_errors: number;
  last_error: string | null;
  last_status: number | null;
  created_at: string;
}

function toOutboxItem(row: OutboxRow): OutboxItem {
  return {
    seq: row.seq,
    id: row.id,
    type: row.type,
    authorUserId: row.author_user_id,
    payload: JSON.parse(row.payload),
    recordedAt: row.recorded_at,
    status: row.status,
    attempts: row.attempts,
    serverErrors: row.server_errors,
    lastError: row.last_error,
    lastStatus: row.last_status,
    createdAt: row.created_at,
  };
}

export interface NewOutboxItem {
  id: string;
  type: OperationType;
  authorUserId: number;
  payload: unknown;
  recordedAt: string;
  createdAt: string;
}

export class StoreOps {
  constructor(private readonly db: SqlExecutor) {}

  async upsertEntity(entity: EntityName, id: number, payload: unknown): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO cache_entities (entity, id, payload) VALUES (?, ?, ?) ' +
        'ON CONFLICT (entity, id) DO UPDATE SET payload = excluded.payload',
      [entity, String(id), JSON.stringify(payload)],
    );
  }

  async deleteEntity(entity: EntityName, id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM cache_entities WHERE entity = ? AND id = ?', [entity, String(id)]);
  }

  async getEntity<T>(entity: EntityName, id: number): Promise<T | null> {
    const row = await this.db.getFirstAsync<{ payload: string }>('SELECT payload FROM cache_entities WHERE entity = ? AND id = ?', [
      entity,
      String(id),
    ]);
    return row ? (JSON.parse(row.payload) as T) : null;
  }

  async listEntities<T>(entity: EntityName): Promise<T[]> {
    const rows = await this.db.getAllAsync<{ payload: string }>('SELECT payload FROM cache_entities WHERE entity = ?', [entity]);
    return rows.map((row) => JSON.parse(row.payload) as T);
  }

  async mapId(localId: number, serverId: number, entity: EntityName): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO id_map (local_id, server_id, entity) VALUES (?, ?, ?) ' +
        'ON CONFLICT (local_id) DO UPDATE SET server_id = excluded.server_id',
      [localId, serverId, entity],
    );
  }

  async resolveId(localId: number): Promise<number | null> {
    const row = await this.db.getFirstAsync<{ server_id: number }>('SELECT server_id FROM id_map WHERE local_id = ?', [localId]);
    return row ? row.server_id : null;
  }

  async getState(key: string): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>('SELECT value FROM sync_state WHERE key = ?', [key]);
    return row ? row.value : null;
  }

  async setState(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO sync_state (key, value) VALUES (?, ?) ' + 'ON CONFLICT (key) DO UPDATE SET value = excluded.value',
      [key, value],
    );
  }

  async allocateLocalId(): Promise<number> {
    const current = Number((await this.getState('next_local_id')) ?? '-1');
    await this.setState('next_local_id', String(current - 1));
    return current;
  }

  async enqueue(item: NewOutboxItem): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO outbox (id, type, author_user_id, payload, recorded_at, status, created_at) ' + "VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      [item.id, item.type, item.authorUserId, JSON.stringify(item.payload), item.recordedAt, item.createdAt],
    );
  }

  async nextPending(userId: number, excludeIds: string[] = []): Promise<OutboxItem | null> {
    const exclusion = excludeIds.length > 0 ? ` AND id NOT IN (${excludeIds.map(() => '?').join(', ')})` : '';
    const row = await this.db.getFirstAsync<OutboxRow>(
      `SELECT * FROM outbox WHERE author_user_id = ? AND status = 'pending'${exclusion} ORDER BY seq LIMIT 1`,
      [userId, ...excludeIds],
    );
    return row ? toOutboxItem(row) : null;
  }

  async hasPendingCreateCat(userId: number, localId: number): Promise<boolean> {
    const items = await this.listOutbox(userId);
    return items.some(
      (item) => item.status === 'pending' && item.type === 'CREATE_CAT' && (item.payload as { localId: number }).localId === localId,
    );
  }

  async getOutbox(id: string): Promise<OutboxItem | null> {
    const row = await this.db.getFirstAsync<OutboxRow>('SELECT * FROM outbox WHERE id = ?', [id]);
    return row ? toOutboxItem(row) : null;
  }

  async listOutbox(userId: number): Promise<OutboxItem[]> {
    const rows = await this.db.getAllAsync<OutboxRow>('SELECT * FROM outbox WHERE author_user_id = ? ORDER BY seq', [userId]);
    return rows.map(toOutboxItem);
  }

  async counts(userId: number): Promise<SyncCounts> {
    const rows = await this.db.getAllAsync<{ status: OutboxStatus; total: number }>(
      'SELECT status, COUNT(*) AS total FROM outbox WHERE author_user_id = ? GROUP BY status',
      [userId],
    );
    const total = (status: OutboxStatus) => rows.find((row) => row.status === status)?.total ?? 0;
    return { pending: total('pending'), rejected: total('rejected') };
  }

  async markAttempt(id: string, error: string, status: number | null): Promise<void> {
    await this.db.runAsync(
      'UPDATE outbox SET attempts = attempts + 1, ' +
        'server_errors = CASE WHEN ? = 500 THEN server_errors + 1 ELSE 0 END, ' +
        'last_error = ?, last_status = ? WHERE id = ?',
      [status, error, status, id],
    );
  }

  async markRejected(id: string, error: string, status: number | null): Promise<void> {
    await this.db.runAsync(
      "UPDATE outbox SET status = 'rejected', attempts = attempts + 1, " + 'last_error = ?, last_status = ? WHERE id = ?',
      [error, status, id],
    );
  }

  async requeue(id: string): Promise<void> {
    await this.db.runAsync(
      "UPDATE outbox SET status = 'pending', attempts = 0, last_error = NULL, last_status = NULL " + "WHERE id = ? AND status = 'rejected'",
      [id],
    );
  }

  async deleteOutbox(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM outbox WHERE id = ?', [id]);
  }
}

export class SyncStore {
  private tail: Promise<unknown> = Promise.resolve();
  private ready: Promise<SqlExecutor> | null = null;

  constructor(private readonly openDatabase: () => Promise<SqlExecutor>) {}

  run<T>(work: (ops: StoreOps) => Promise<T>): Promise<T> {
    return this.serialize(async (db) => work(new StoreOps(db)));
  }

  transaction<T>(work: (ops: StoreOps) => Promise<T>): Promise<T> {
    return this.serialize(async (db) => {
      let result!: T;
      await db.withTransactionAsync(async () => {
        result = await work(new StoreOps(db));
      });
      return result;
    });
  }

  private database(): Promise<SqlExecutor> {
    if (!this.ready) {
      this.ready = this.openDatabase().then(async (db) => {
        await runMigrations(db);
        return db;
      });
    }
    return this.ready;
  }

  private serialize<T>(work: (db: SqlExecutor) => Promise<T>): Promise<T> {
    const next = this.tail.then(
      async () => work(await this.database()),
      async () => work(await this.database()),
    );
    this.tail = next.catch(() => undefined);
    return next;
  }
}
