import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildStockQuery } from './stockQuery';

describe('buildStockQuery', () => {
  it('builds stock filters and pagination parameters', () => {
    const query = buildStockQuery({
      search: '  Amoxicilina 250mg  ',
      category: 'Antibiótico',
      status: 'Low',
      expirationFrom: '2026-10-08',
      expirationTo: '2026-12-31',
      page: 2,
      size: 15,
    });

    const params = new URLSearchParams(query);

    assert.equal(params.get('search'), 'Amoxicilina 250mg');
    assert.equal(params.get('category'), 'Antibiótico');
    assert.equal(params.get('status'), 'Low');
    assert.equal(params.get('expirationFrom'), '2026-10-08');
    assert.equal(params.get('expirationTo'), '2026-12-31');
    assert.equal(params.get('page'), '2');
    assert.equal(params.get('size'), '15');
  });

  it('uses default pagination and omits empty optional filters', () => {
    const query = buildStockQuery({
      search: '   ',
    });

    const params = new URLSearchParams(query);

    assert.equal(params.get('page'), '0');
    assert.equal(params.get('size'), '20');

    assert.equal(params.has('search'), false);
    assert.equal(params.has('category'), false);
    assert.equal(params.has('status'), false);
    assert.equal(params.has('expirationFrom'), false);
    assert.equal(params.has('expirationTo'), false);
  });

});
