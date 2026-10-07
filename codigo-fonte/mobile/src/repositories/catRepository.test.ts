import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CAT_REQUEST, createHarness, emptyPull, serverCat } from '../testing/harness';

describe('catRepository', () => {
  it('lists cached cats filtered and sorted by name', async () => {
    const h = createHarness();
    await h.store.run(async (ops) => {
      await ops.upsertEntity('cat', 1, serverCat(1, 'Zeca', { generalStatus: 'UnderTreatment' }));
      await ops.upsertEntity('cat', 2, serverCat(2, 'Ágata', { microchip: '123456789012345' }));
      await ops.upsertEntity('cat', 3, serverCat(3, 'Mel', { generalStatus: 'UnderTreatment' }));
    });

    assert.deepEqual(
      (await h.catRepository.listCats()).map((cat) => cat.name),
      ['Ágata', 'Mel', 'Zeca'],
    );
    assert.deepEqual(
      (await h.catRepository.listCats({ generalStatus: 'UnderTreatment' })).map((cat) => cat.name),
      ['Mel', 'Zeca'],
    );
    assert.deepEqual(
      (await h.catRepository.listCats({ search: '1234' })).map((cat) => cat.name),
      ['Ágata'],
    );
    assert.deepEqual(
      (await h.catRepository.listCats({ search: ' ZEC ' })).map((cat) => cat.name),
      ['Zeca'],
    );
  });

  it('creates an optimistic cat with the room title and queues the creation', async () => {
    const h = createHarness();
    await h.store.run((ops) => ops.upsertEntity('room', 4, { id: 4, title: 'Sala 4', active: true }));

    const cat = await h.catRepository.createCat(1, { ...CAT_REQUEST, roomId: 4 });

    assert.ok(cat.id < 0);
    assert.equal(cat.roomTitle, 'Sala 4');
    assert.equal(cat.healthStatus, 'NotTested');
    const [queued] = await h.store.run((ops) => ops.listOutbox(1));
    assert.equal(queued.type, 'CREATE_CAT');
    assert.equal((queued.payload as { localId: number }).localId, cat.id);
  });

  it('gives each local cat its own id', async () => {
    const h = createHarness();

    const first = await h.catRepository.createCat(1, CAT_REQUEST);
    const second = await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Mel' });

    assert.notEqual(first.id, second.id);
  });

  it('only lists active rooms', async () => {
    const h = createHarness();
    await h.store.run(async (ops) => {
      await ops.upsertEntity('room', 1, { id: 1, title: 'B', active: true });
      await ops.upsertEntity('room', 2, { id: 2, title: 'A', active: true });
      await ops.upsertEntity('room', 3, { id: 3, title: 'C', active: false });
    });

    assert.deepEqual(
      (await h.catRepository.listActiveRooms()).map((room) => room.title),
      ['A', 'B'],
    );
  });

  it('falls back to the server for a missing cat and caches it', async () => {
    const h = createHarness();
    const { createCatRepository } = await import('./catRepository');
    const repository = createCatRepository({
      store: h.store,
      outbox: h.outbox,
      now: () => new Date(),
      fetchRemoteCat: async (id) => serverCat(id, 'Remota') as never,
    });

    assert.equal((await repository.getCat(30))?.name, 'Remota');
    assert.equal((await h.catRepository.getCat(30))?.name, 'Remota');
    assert.equal(await repository.getCat(-9), null);
  });

  it('does not pull while the queue is blocked, keeping the local cat visible', async () => {
    const h = createHarness((request) => {
      if (request.path === '/cats') {
        throw new Error('rede');
      }
      return { ...emptyPull('c'), cats: [serverCat(1, 'Bento')] };
    });

    await h.catRepository.createCat(1, CAT_REQUEST);
    await h.engine.syncNow();

    assert.equal(h.http.to('GET', '/sync/pull').length, 0);
    assert.deepEqual(
      (await h.catRepository.listCats()).map((cat) => cat.name),
      ['Nina'],
    );
  });
});
