import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DISPLAY_FONT, normalizeWeight } from './fonts';

describe('normalizeWeight', () => {
  it('maps the font weights used by the app to the loaded files', () => {
    assert.equal(normalizeWeight(undefined), '400');
    assert.equal(normalizeWeight('normal'), '400');
    assert.equal(normalizeWeight('400'), '400');
    assert.equal(normalizeWeight('500'), '500');
    assert.equal(normalizeWeight('600'), '600');
    assert.equal(normalizeWeight('700'), '700');
    assert.equal(normalizeWeight('bold'), '700');
    assert.equal(normalizeWeight('800'), '700');
  });

  it('exposes the marker used by display styles', () => {
    assert.equal(DISPLAY_FONT, 'display');
  });
});
