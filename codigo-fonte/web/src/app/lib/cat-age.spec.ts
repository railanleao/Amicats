import { ageInMonths, formatAge, parseAgeText } from './cat-age';

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

  it('parses "N anos"/"N ano" back into an estimated birth date', () => {
    expect(parseAgeText('4 anos', today)).toBe('2022-10-02');
    expect(parseAgeText('1 ano', today)).toBe('2025-10-02');
    expect(parseAgeText('4anos', today)).toBe('2022-10-02');
  });

  it('parses "N meses"/"N mês" back into an estimated birth date', () => {
    expect(parseAgeText('6 meses', today)).toBe('2026-04-02');
    expect(parseAgeText('1 mês', today)).toBe('2026-09-02');
  });

  it('treats a bare number as years', () => {
    expect(parseAgeText('4', today)).toBe('2022-10-02');
  });

  it('accepts whatever formatAge produces, even though the date is only approximate', () => {
    expect(parseAgeText(formatAge('2022-09-01', today) as string, today)).toBe('2022-10-02');
  });

  it('returns null for blank or unparseable text, leaving the existing date untouched', () => {
    expect(parseAgeText('', today)).toBeNull();
    expect(parseAgeText('   ', today)).toBeNull();
    expect(parseAgeText('filhote', today)).toBeNull();
  });
});
