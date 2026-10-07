import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatClockTime, formatRelativeTime } from './relativeTime';

const NOW = new Date('2026-10-03T12:00:00Z');

describe('formatRelativeTime', () => {
  it('formats the common ranges in Portuguese', () => {
    assert.equal(formatRelativeTime(null, NOW), 'nunca');
    assert.equal(formatRelativeTime('2026-10-03T11:59:40Z', NOW), 'agora mesmo');
    assert.equal(formatRelativeTime('2026-10-03T11:59:00Z', NOW), 'há 1 minuto');
    assert.equal(formatRelativeTime('2026-10-03T11:56:00Z', NOW), 'há 4 minutos');
    assert.equal(formatRelativeTime('2026-10-03T10:00:00Z', NOW), 'há 2 horas');
    assert.equal(formatRelativeTime('2026-10-02T11:00:00Z', NOW), 'há 1 dia');
    assert.equal(formatRelativeTime('2026-09-29T12:00:00Z', NOW), 'há 4 dias');
  });
});

describe('formatClockTime', () => {
  it('pads hours and minutes', () => {
    const date = new Date(2026, 9, 3, 8, 5);

    assert.equal(formatClockTime(date.toISOString()), '08:05');
  });
});
