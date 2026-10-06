import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CAT_REQUEST, createHarness, emptyPull, serverCat } from '../testing/harness';
import { toLocalDateTime } from './engine';
import { HttpError } from './types';
import type { HttpRequest } from './types';
import { discardOperation } from './queueActions';
import type { Cat } from '../types/cat';

function okHandler(overrides: (request: HttpRequest) => unknown = () => undefined) {
  return (request: HttpRequest) => {
    const custom = overrides(request);
    if (custom !== undefined) {
      return custom;
    }
    if (request.method === 'GET' && request.path.startsWith('/sync/pull')) {
      return emptyPull('2026-10-03T11:59:00');
    }
    if (request.path === '/sync/heartbeat') {
      return undefined;
    }
    throw new Error(`Unexpected request ${request.method} ${request.path}`);
  };
}

describe('SyncEngine', () => {
  it('pushes a locally created cat, replaces the local row and reports the queue', async () => {
    const h = createHarness(okHandler((request) => (request.path === '/cats' ? serverCat(55, 'Nina') : undefined)));

    const local = await h.catRepository.createCat(1, CAT_REQUEST);
    assert.ok(local.id < 0);
    assert.equal(local.generalStatus, 'InTriage');
    assert.equal(h.enqueued.count, 1);

    const result = await h.engine.syncNow();

    assert.deepEqual(
      { pushed: result.pushed, rejected: result.rejected, blockedBy: result.blockedBy },
      { pushed: 1, rejected: 0, blockedBy: null },
    );

    const create = h.http.to('POST', '/cats')[0];
    assert.equal(create.headers?.['Idempotency-Key'], 'op-1');
    assert.deepEqual(create.body, CAT_REQUEST);

    const cats = await h.catRepository.listCats();
    assert.deepEqual(
      cats.map((cat) => cat.id),
      [55],
    );
    assert.equal((await h.catRepository.getCat(local.id))?.id, 55);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 0, rejected: 0 });

    const heartbeat = h.http.to('POST', '/sync/heartbeat')[0];
    assert.deepEqual(heartbeat.body, {
      deviceId: 'device-test',
      deviceName: 'Galaxy',
      platform: 'android',
      appVersion: '1.0.0',
      pendingCount: 0,
      rejectedCount: 0,
      lastSyncAt: toLocalDateTime(new Date('2026-10-03T12:00:00Z')),
    });
  });

  it('resolves the local cat id in dependent operations', async () => {
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          return serverCat(55, 'Nina');
        }
        if (request.path === '/cats/55/photo') {
          return serverCat(55, 'Nina', { photoUrl: '/cats/55/photo' });
        }
        return undefined;
      }),
    );

    await h.catRepository.createCat(1, CAT_REQUEST, 'file:///photo.jpg');
    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 2);
    const upload = h.http.to('PUT', '/cats/55/photo')[0];
    assert.deepEqual(upload.multipart, {
      fieldName: 'file',
      uri: 'file:///photo.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    assert.equal(upload.headers?.['Idempotency-Key'], 'op-2');

    const cats = await h.catRepository.listCats();
    assert.equal(cats[0].photoUrl, '/cats/55/photo');
  });

  it('keeps the queue and reuses the same idempotency key after a network failure', async () => {
    let online = false;
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          if (!online) {
            throw new HttpError('Não foi possível conectar ao servidor.');
          }
          return serverCat(7, 'Nina');
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, CAT_REQUEST);

    const offline = await h.engine.syncNow();

    assert.equal(offline.blockedBy, 'network');
    assert.equal(offline.pulled, false);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });
    const [item] = await h.store.run((ops) => ops.listOutbox(1));
    assert.equal(item.attempts, 1);
    assert.equal(h.http.to('POST', '/sync/heartbeat').length, 0);

    online = true;
    const recovered = await h.engine.syncNow();

    assert.equal(recovered.blockedBy, null);
    const keys = h.http.to('POST', '/cats').map((call) => call.headers?.['Idempotency-Key']);
    assert.deepEqual(keys, ['op-1', 'op-1']);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 0, rejected: 0 });
  });

  it('stops on server errors without rejecting the operation', async () => {
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          throw new HttpError('Erro interno', 503);
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, CAT_REQUEST);

    const result = await h.engine.syncNow();

    assert.equal(result.blockedBy, 'server');
    assert.equal(result.pulled, true);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });
    assert.equal(h.http.to('GET', '/sync/pull').length, 1);
  });

  it('keeps sending independent operations when one of them keeps failing', async () => {
    const h = createHarness(
      okHandler((request) => {
        const body = request.body as { name?: string } | undefined;
        if (request.path === '/cats' && body?.name === 'Quebrado') {
          throw new HttpError('Indisponível', 503);
        }
        if (request.path === '/cats') {
          return serverCat(70, body?.name ?? 'Mel');
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Quebrado' });
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Mel' });

    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 1);
    assert.equal(result.blockedBy, 'server');
    assert.equal(result.pulled, true);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });
  });

  it('defers a photo whose cat is still pending instead of rejecting it', async () => {
    const h = createHarness(
      okHandler((request) => {
        const body = request.body as { name?: string } | undefined;
        if (request.path === '/cats' && body?.name === 'Quebrado') {
          throw new HttpError('Indisponível', 503);
        }
        if (request.path === '/cats') {
          return serverCat(71, body?.name ?? 'Mel');
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Quebrado' }, 'file:///foto.jpg');
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Mel' });

    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 1);
    assert.equal(result.rejected, 0);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 2, rejected: 0 });
    assert.equal(h.http.to('PUT', '/cats').length, 0);
  });

  it('stops the run after two consecutive failures so an offline device is not hammered', async () => {
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          throw new HttpError('Sem rede');
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'A' });
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'B' });
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'C' });

    const result = await h.engine.syncNow();

    assert.equal(result.blockedBy, 'network');
    assert.equal(h.http.to('POST', '/cats').length, 2);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 3, rejected: 0 });
  });

  it('starts a new run when the previous one hung for too long', async () => {
    let calls = 0;
    const h = createHarness((request) => {
      if (request.method === 'GET' && request.path.startsWith('/sync/pull')) {
        calls += 1;
        return calls === 1 ? new Promise(() => undefined) : emptyPull('2026-10-03T11:59:00');
      }
      return undefined;
    });

    void h.engine.syncNow();
    h.advance(91_000);
    const recovered = await h.engine.syncNow();

    assert.equal(recovered.blockedBy, null);
    assert.equal(calls, 2);
  });

  it('rejects an operation after five consecutive 500s so it cannot block the queue', async () => {
    const h = createHarness(
      okHandler((request) => {
        const body = request.body as { name?: string } | undefined;
        if (request.path === '/cats' && body?.name === 'Veneno') {
          throw new HttpError('Erro interno', 500);
        }
        if (request.path === '/cats') {
          return serverCat(8, 'Mel');
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Veneno' });
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Mel' });

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const result = await h.engine.syncNow();
      assert.equal(result.blockedBy, 'server', `tentativa ${attempt}`);
      assert.equal(result.pushed, attempt === 1 ? 1 : 0, `tentativa ${attempt}`);
    }
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });

    const fifth = await h.engine.syncNow();

    assert.equal(fifth.rejected, 1);
    assert.equal(fifth.pushed, 0);
    assert.equal(fifth.blockedBy, null);
    const items = await h.store.run((ops) => ops.listOutbox(1));
    assert.equal(items.length, 1);
    assert.equal(items[0].status, 'rejected');
    assert.match(items[0].lastError ?? '', /erro 500\) após 5 tentativas/);
    assert.deepEqual((await h.catRepository.listCats()).map((cat) => cat.id).sort(), [-1, 8]);
  });

  it('does not count network errors or 503s toward the 500 limit', async () => {
    let failure: () => never = () => {
      throw new HttpError('Sem sinal');
    };
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          return failure();
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, CAT_REQUEST);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await h.engine.syncNow();
    }
    failure = () => {
      throw new HttpError('Indisponível', 503);
    };
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await h.engine.syncNow();
    }
    failure = () => {
      throw new HttpError('Erro interno', 500);
    };
    await h.engine.syncNow();

    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });
  });

  it('restarts the 500 count when another kind of failure happens in between', async () => {
    const statuses = [500, 500, 500, 500, 503, 500, 500, 500, 500];
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          throw new HttpError('x', statuses.shift());
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, CAT_REQUEST);

    for (let attempt = 0; attempt < 9; attempt += 1) {
      await h.engine.syncNow();
    }

    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });
  });

  it('treats 425 and 429 as transient', async () => {
    for (const status of [425, 429, 408]) {
      const h = createHarness(
        okHandler((request) => {
          if (request.path === '/cats') {
            throw new HttpError('Tente novamente', status);
          }
          return undefined;
        }),
      );
      await h.catRepository.createCat(1, CAT_REQUEST);

      const result = await h.engine.syncNow();

      assert.equal(result.blockedBy, 'server', `status ${status}`);
      assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 1, rejected: 0 });
    }
  });

  it('rejects business errors, keeps draining and rejects dependents of a rejected create', async () => {
    const h = createHarness(
      okHandler((request) => {
        const body = request.body as { name?: string } | undefined;
        if (request.path === '/cats' && body?.name === 'Duplicado') {
          throw new HttpError('Microchip já cadastrado.', 409);
        }
        if (request.path === '/cats') {
          return serverCat(9, 'Mel');
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Duplicado' }, 'file:///a.jpg');
    await h.catRepository.createCat(1, { ...CAT_REQUEST, name: 'Mel' });

    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 1);
    assert.equal(result.rejected, 2);
    assert.equal(result.blockedBy, null);

    const items = await h.store.run((ops) => ops.listOutbox(1));
    const byType = items.map((item) => [item.type, item.status, item.lastError]);
    assert.deepEqual(byType, [
      ['CREATE_CAT', 'rejected', 'Microchip já cadastrado.'],
      ['UPLOAD_CAT_PHOTO', 'rejected', 'Depende de um registro que não foi sincronizado.'],
    ]);
    assert.equal(h.http.to('PUT', '/cats/').length, 0);
  });

  it('stops without consuming the item on 401', async () => {
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          throw new HttpError('Sessão expirada', 401);
        }
        return undefined;
      }),
    );
    await h.catRepository.createCat(1, CAT_REQUEST);

    const result = await h.engine.syncNow();

    assert.equal(result.blockedBy, 'unauthorized');
    const [item] = await h.store.run((ops) => ops.listOutbox(1));
    assert.equal(item.status, 'pending');
    assert.equal(item.attempts, 0);
    assert.equal(h.http.to('POST', '/sync/heartbeat').length, 0);
  });

  it('only sends operations authored by the logged user', async () => {
    const h = createHarness();
    await h.catRepository.createCat(2, CAT_REQUEST);

    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 0);
    assert.equal(h.http.to('POST', '/cats').length, 0);
    assert.deepEqual(await h.store.run((ops) => ops.counts(2)), { pending: 1, rejected: 0 });
  });

  it('does nothing without a logged user', async () => {
    const h = createHarness();
    h.setUser(null);

    const result = await h.engine.syncNow();

    assert.equal(result.skipped, true);
    assert.equal(h.http.calls.length, 0);
  });

  it('shares a single execution between concurrent calls', async () => {
    const h = createHarness(okHandler((request) => (request.path === '/cats' ? serverCat(3, 'Nina') : undefined)));
    await h.catRepository.createCat(1, CAT_REQUEST);

    const [first, second] = await Promise.all([h.engine.syncNow(), h.engine.syncNow()]);

    assert.equal(first, second);
    assert.equal(h.http.to('POST', '/cats').length, 1);
  });

  it('applies pulled changes, stores the cursor and sends it on the next pull', async () => {
    let call = 0;
    const h = createHarness((request) => {
      if (request.method === 'GET') {
        call += 1;
        return call === 1
          ? {
              cursor: '2026-10-03T11:00:00',
              cats: [serverCat(1, 'Bento')],
              rooms: [{ id: 4, title: 'Sala 4', active: true }],
              stockItems: [{ id: 8, name: 'Amoxicilina' }],
              prescribedMedications: [{ id: 2 }],
            }
          : emptyPull('2026-10-03T11:30:00');
      }
      return undefined;
    });

    await h.engine.syncNow();
    await h.engine.syncNow();

    const pulls = h.http.to('GET', '/sync/pull');
    assert.equal(pulls[0].path, '/sync/pull');
    assert.equal(pulls[1].path, `/sync/pull?since=${encodeURIComponent('2026-10-03T11:00:00')}`);
    assert.equal((await h.catRepository.listCats()).length, 1);
    assert.equal((await h.catRepository.listActiveRooms())[0].title, 'Sala 4');
    assert.equal(await h.store.run((ops) => ops.getState('cursor')), '2026-10-03T11:30:00');
    assert.equal((await h.store.run((ops) => ops.listEntities('prescribed_medication'))).length, 1);
  });

  it('keeps pushed work when the pull fails and does not mark the sync as complete', async () => {
    const h = createHarness((request) => {
      if (request.path === '/cats') {
        return serverCat(5, 'Nina');
      }
      if (request.method === 'GET') {
        throw new HttpError('Sem sinal');
      }
      return undefined;
    });
    await h.catRepository.createCat(1, CAT_REQUEST);

    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 1);
    assert.equal(result.pulled, false);
    assert.equal(result.blockedBy, 'network');
    assert.equal((await h.engine.snapshot()).lastSyncAt, null);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 0, rejected: 0 });
  });

  it('ignores heartbeat failures', async () => {
    const h = createHarness((request) => {
      if (request.path === '/sync/heartbeat') {
        throw new HttpError('boom', 500);
      }
      return emptyPull('2026-10-03T11:00:00');
    });

    const result = await h.engine.syncNow();

    assert.equal(result.blockedBy, null);
    assert.ok((await h.engine.snapshot()).lastSyncAt);
  });

  it('reports the rejected count in the heartbeat and lets the user discard a rejected cat', async () => {
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          throw new HttpError('Dados inválidos', 400);
        }
        return undefined;
      }),
    );
    const local = await h.catRepository.createCat(1, CAT_REQUEST);

    await h.engine.syncNow();

    const heartbeat = h.http.to('POST', '/sync/heartbeat')[0].body as { rejectedCount: number };
    assert.equal(heartbeat.rejectedCount, 1);
    assert.equal((await h.catRepository.listCats()).length, 1);

    const [item] = await h.store.run((ops) => ops.listOutbox(1));
    await discardOperation(h.store, item.id);

    assert.equal((await h.catRepository.listCats()).length, 0);
    assert.equal(await h.catRepository.getCat(local.id), null);
    assert.deepEqual(await h.store.run((ops) => ops.counts(1)), { pending: 0, rejected: 0 });
  });

  it('builds stock entry and prescription requests with resolved ids', async () => {
    const h = createHarness(
      okHandler((request) => {
        if (request.path === '/cats') {
          return serverCat(21, 'Nina');
        }
        return request.method === 'POST' ? {} : undefined;
      }),
    );
    const local: Cat = await h.catRepository.createCat(1, CAT_REQUEST);

    await h.store.transaction(async (ops) => {
      await h.outbox.enqueueWithin(ops, 'CREATE_INTERNAL_PRESCRIPTION', 1, {
        catId: local.id,
        catName: 'Nina',
        request: {
          title: 'Reavaliação',
          notes: null,
          medication: null,
          recordedAt: '2026-10-03T08:00:00',
        },
      });
      await h.outbox.enqueueWithin(ops, 'CREATE_STOCK_ENTRY', 1, {
        itemName: 'Amoxicilina',
        request: {
          stockItemId: 8,
          origin: 'PURCHASED',
          donorName: null,
          quantity: 10,
          entryDate: '2026-10-03',
          expirationDate: null,
        },
      });
    });

    const result = await h.engine.syncNow();

    assert.equal(result.pushed, 3);
    const prescription = h.http.to('POST', '/cats/21/internal-medical-prescriptions')[0];
    assert.equal((prescription.body as { recordedAt: string }).recordedAt, '2026-10-03T08:00:00');
    const entry = h.http.to('POST', '/stock/entries')[0];
    assert.equal((entry.body as { stockItemId: number }).stockItemId, 8);
  });
});
