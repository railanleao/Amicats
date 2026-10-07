import { parseServerDateTime } from './server-date';

describe('parseServerDateTime', () => {
  it('reads a LocalDateTime from the API as UTC', () => {
    expect(parseServerDateTime('2026-10-05T22:20:00').toISOString()).toBe(
      '2026-10-05T22:20:00.000Z',
    );
  });

  it('keeps values that already carry an offset', () => {
    expect(parseServerDateTime('2026-10-05T22:20:00Z').toISOString()).toBe(
      '2026-10-05T22:20:00.000Z',
    );
    expect(parseServerDateTime('2026-10-05T19:20:00-03:00').toISOString()).toBe(
      '2026-10-05T22:20:00.000Z',
    );
  });
});
