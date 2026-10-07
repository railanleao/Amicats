import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MIGRATIONS, runMigrations } from '../db/migrations';
import { createNodeSqliteExecutor } from '../testing/nodeSqliteExecutor';
import { SyncStore } from './store';

function newStore() {
  return new SyncStore(async () => createNodeSqliteExecutor());
}

function item(id: string, userId = 1) {
  return {
    id,
    type: 'CREATE_CAT' as const,
    authorUserId: userId,
    payload: { id },
    recordedAt: '2026-10-03T10:00:00.000Z',
    createdAt: '2026-10-03T10:00:00.000Z',
  };
}

describe('migrations', () => {
  it('is idempotent and records the schema version', async () => {
    const db = createNodeSqliteExecutor();
    const latest = MIGRATIONS[MIGRATIONS.length - 1].version;

    assert.equal(await runMigrations(db), latest);
    assert.equal(await runMigrations(db), latest);

    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    assert.equal(row?.user_version, latest);
  });
});

describe('SyncStore', () => {
  it('returns pending operations in insertion order and skips rejected ones', async () => {
    const store = newStore();
    await store.transaction(async (ops) => {
      await ops.enqueue(item('a'));
      await ops.enqueue(item('b'));
      await ops.enqueue(item('c'));
    });

    assert.equal((await store.run((ops) => ops.nextPending(1)))?.id, 'a');

    await store.run((ops) => ops.markRejected('a', 'recusado', 400));

    assert.equal((await store.run((ops) => ops.nextPending(1)))?.id, 'b');
    assert.deepEqual(await store.run((ops) => ops.counts(1)), { pending: 2, rejected: 1 });
  });

  it('counts consecutive 500s and resets the count on any other failure', async () => {
    const store = newStore();
    await store.run((ops) => ops.enqueue(item('a')));

    await store.run((ops) => ops.markAttempt('a', 'x', 500));
    await store.run((ops) => ops.markAttempt('a', 'x', 500));
    assert.equal((await store.run((ops) => ops.getOutbox('a')))?.serverErrors, 2);

    await store.run((ops) => ops.markAttempt('a', 'x', null));
    assert.equal((await store.run((ops) => ops.getOutbox('a')))?.serverErrors, 0);
  });

  it('requeues only rejected operations', async () => {
    const store = newStore();
    await store.run((ops) => ops.enqueue(item('a')));
    await store.run((ops) => ops.markRejected('a', 'recusado', 400));

    await store.run((ops) => ops.requeue('a'));

    const queued = await store.run((ops) => ops.getOutbox('a'));
    assert.equal(queued?.status, 'pending');
    assert.equal(queued?.attempts, 0);
    assert.equal(queued?.lastError, null);
  });

  it('allocates decreasing local ids', async () => {
    const store = newStore();

    const ids = [
      await store.run((ops) => ops.allocateLocalId()),
      await store.run((ops) => ops.allocateLocalId()),
      await store.run((ops) => ops.allocateLocalId()),
    ];

    assert.deepEqual(ids, [-1, -2, -3]);
  });

  it('rolls back a failed transaction', async () => {
    const store = newStore();

    await assert.rejects(
      store.transaction(async (ops) => {
        await ops.enqueue(item('a'));
        throw new Error('falha');
      }),
      /falha/,
    );

    assert.equal(await store.run((ops) => ops.getOutbox('a')), null);
  });

  it('keeps later work running after a failure', async () => {
    const store = newStore();

    await assert.rejects(store.run(async () => Promise.reject(new Error('x'))));
    await store.run((ops) => ops.enqueue(item('ok')));

    assert.equal((await store.run((ops) => ops.getOutbox('ok')))?.id, 'ok');
  });

  it('serializes concurrent transactions without interleaving them', async () => {
    const store = newStore();
    const order: string[] = [];

    await Promise.all([
      store.transaction(async (ops) => {
        order.push('a:start');
        await ops.enqueue(item('a'));
        await new Promise((resolve) => setTimeout(resolve, 10));
        order.push('a:end');
      }),
      store.transaction(async (ops) => {
        order.push('b:start');
        await ops.enqueue(item('b'));
        order.push('b:end');
      }),
    ]);

    assert.deepEqual(order, ['a:start', 'a:end', 'b:start', 'b:end']);
  });

  it('upserts and resolves cache entities and id mappings', async () => {
    const store = newStore();

    await store.run(async (ops) => {
      await ops.upsertEntity('cat', 1, { id: 1, name: 'A' });
      await ops.upsertEntity('cat', 1, { id: 1, name: 'B' });
      await ops.mapId(-1, 10, 'cat');
    });

    assert.deepEqual(await store.run((ops) => ops.listEntities('cat')), [{ id: 1, name: 'B' }]);
    assert.equal(await store.run((ops) => ops.resolveId(-1)), 10);
    assert.equal(await store.run((ops) => ops.resolveId(-2)), null);
  });
});
