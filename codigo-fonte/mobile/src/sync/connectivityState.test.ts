import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasNetworkInterface } from './connectivityState';

describe('hasNetworkInterface', () => {
  it('is false only when the device reports no connection', () => {
    assert.equal(hasNetworkInterface({ isConnected: false }), false);
  });

  it('does not treat an unknown state as offline', () => {
    assert.equal(hasNetworkInterface({ isConnected: null }), true);
    assert.equal(hasNetworkInterface({ isConnected: true }), true);
  });
});
