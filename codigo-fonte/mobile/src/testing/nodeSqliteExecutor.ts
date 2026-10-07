import { DatabaseSync } from 'node:sqlite';
import type { SqlExecutor, SqlValue } from '../db/sqlExecutor';

export function createNodeSqliteExecutor(): SqlExecutor {
  const db = new DatabaseSync(':memory:');

  return {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    runAsync: async (sql, params: SqlValue[] = []) => {
      const result = db.prepare(sql).run(...params);
      return {
        changes: Number(result.changes),
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    getAllAsync: async <T>(sql: string, params: SqlValue[] = []) => db.prepare(sql).all(...params) as T[],
    getFirstAsync: async <T>(sql: string, params: SqlValue[] = []) => (db.prepare(sql).get(...params) as T | undefined) ?? null,
    withTransactionAsync: async (task) => {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
