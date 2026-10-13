import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildNewStockItemRequest } from './stock';

describe('buildNewStockItemRequest', () => {
  it('builds a new stock item with the informed unit', () => {
    const request = buildNewStockItemRequest(
      '  Dipirona 500mg  ',
      'Medicamento',
      '  comprimidos  ',
    );

    assert.deepEqual(request, {
      name: 'Dipirona 500mg',
      category: 'Medicamento',
      quantity: 0,
      unit: 'comprimidos',
      notes: null,
    });
  });
});
