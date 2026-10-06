import { ageInMonths, formatAge } from './cat-age';

describe('cat-age', () => {
  const today = new Date(2026, 9, 2); // 2 de outubro de 2026

  it('counts a month only after the birthday day has passed', () => {
    expect(ageInMonths('2026-09-02', today)).toBe(1);
    expect(ageInMonths('2026-09-03', today)).toBe(0);
  });

  it('shows months below one year and years from then on', () => {
    expect(formatAge('2026-09-02', today)).toBe('1 mês');
    expect(formatAge('2026-01-01', today)).toBe('9 meses');
    expect(formatAge('2025-08-01', today)).toBe('1 ano');
    expect(formatAge('2022-09-01', today)).toBe('4 anos');
  });

  it('returns null for a missing, invalid or future date', () => {
    expect(formatAge(null, today)).toBeNull();
    expect(formatAge('abc', today)).toBeNull();
    expect(formatAge('2027-01-01', today)).toBeNull();
  });
});
