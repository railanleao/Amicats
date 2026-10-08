import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildNewStockItemRequest } from './stock';

describe('buildNewStockItemRequest', () => {
  it('builds a new stock item with the mobile defaults', () => {
    const request = buildNewStockItemRequest(
      '  Dipirona 500mg  ',
      'Anti-inflamatório',
    );

    assert.deepEqual(request, {
      name: 'Dipirona 500mg',
      category: 'Anti-inflamatório',
      quantity: 0,
      unit: 'unidades',
      notes: null,
    });
  });
});
