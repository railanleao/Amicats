import type { SqlExecutor } from './sqlExecutor';

interface Migration {
  version: number;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE outbox (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        author_user_id INTEGER NOT NULL,
        payload TEXT NOT NULL,
        recorded_at TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'rejected')),
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        last_status INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE INDEX idx_outbox_author_status ON outbox (author_user_id, status, seq);

      CREATE TABLE cache_entities (
        entity TEXT NOT NULL,
        id TEXT NOT NULL,
        payload TEXT NOT NULL,
        PRIMARY KEY (entity, id)
      );

      CREATE TABLE sync_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE id_map (
        local_id INTEGER PRIMARY KEY,
        server_id INTEGER NOT NULL,
        entity TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE outbox ADD COLUMN server_errors INTEGER NOT NULL DEFAULT 0;
    `,
  },
];

export async function runMigrations(db: SqlExecutor): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }

  return MIGRATIONS[MIGRATIONS.length - 1].version;
}
