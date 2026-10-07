import { formatRelativeTime } from './relative-time';

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-03T12:00:00Z');

  it('returns "nunca" when there is no date', () => {
    expect(formatRelativeTime(null, now)).toBe('nunca');
  });

  it('formats minutes, hours and days in Portuguese', () => {
    expect(formatRelativeTime('2026-10-03T11:59:40Z', now)).toBe('agora mesmo');
    expect(formatRelativeTime('2026-10-03T11:59:00Z', now)).toBe('há 1 minuto');
    expect(formatRelativeTime('2026-10-03T11:56:00Z', now)).toBe(
      'há 4 minutos',
    );
    expect(formatRelativeTime('2026-10-03T10:00:00Z', now)).toBe('há 2 horas');
    expect(formatRelativeTime('2026-10-02T11:00:00Z', now)).toBe('há 1 dia');
    expect(formatRelativeTime('2026-09-29T12:00:00Z', now)).toBe('há 4 dias');
  });
});
