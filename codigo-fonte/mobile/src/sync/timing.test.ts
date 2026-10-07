import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { nextSyncDelayMs, SYNC_INTERVAL_MS } from './timing';

describe('nextSyncDelayMs', () => {
  it('stays within 20% of the base interval', () => {
    assert.equal(nextSyncDelayMs(0), 96_000);
    assert.equal(nextSyncDelayMs(0.5), SYNC_INTERVAL_MS);
    assert.equal(nextSyncDelayMs(1), 144_000);
  });
});
