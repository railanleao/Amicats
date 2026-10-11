import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createHarness } from '../testing/harness';
import { createStockRepository } from './stockRepository';

describe('stockRepository', () => {
  it('queues a stock entry with the selected item and entry data', async () => {
    const h = createHarness();

    const stockRepository = createStockRepository({
      store: h.store,
      outbox: h.outbox,
    });

    await stockRepository.createStockEntry(
      7,
      'Dipirona 500mg',
      {
        stockItemId: 15,
        origin: 'DONATED',
        donorName: 'Maria',
        quantity: 10,
        entryDate: '2026-10-08',
        expirationDate: '2027-10-08',
      },
    );

    const [queued] = await h.store.run((ops) => ops.listOutbox(7));

    assert.equal(queued.type, 'CREATE_STOCK_ENTRY');

    assert.deepEqual(queued.payload, {
      itemName: 'Dipirona 500mg',
      request: {
        stockItemId: 15,
        origin: 'DONATED',
        donorName: 'Maria',
        quantity: 10,
        entryDate: '2026-10-08',
        expirationDate: '2027-10-08',
      },
    });
  });

it('queues a purchased stock entry without donor or expiration date', async () => {
  const h = createHarness();

  const stockRepository = createStockRepository({
    store: h.store,
    outbox: h.outbox,
  });

  await stockRepository.createStockEntry(
    7,
    'Amoxicilina 250mg',
    {
      stockItemId: 20,
      origin: 'PURCHASED',
      donorName: null,
      quantity: 5,
      entryDate: '2026-10-08',
      expirationDate: null,
    },
  );

  const [queued] = await h.store.run((ops) => ops.listOutbox(7));

  assert.equal(queued.type, 'CREATE_STOCK_ENTRY');

  assert.deepEqual(queued.payload, {
    itemName: 'Amoxicilina 250mg',
    request: {
      stockItemId: 20,
      origin: 'PURCHASED',
      donorName: null,
      quantity: 5,
      entryDate: '2026-10-08',
      expirationDate: null,
    },
  });
});

});
