export function ageInMonths(
  birthDate: string,
  today: Date = new Date(),
): number | null {
  const [year, month, day] = birthDate.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  let months =
    (today.getFullYear() - year) * 12 + (today.getMonth() + 1 - month);
  if (today.getDate() < day) {
    months--;
  }
  return months >= 0 ? months : null;
}

export function formatAge(
  birthDate: string | null,
  today: Date = new Date(),
): string | null {
  if (!birthDate) {
    return null;
  }

  const months = ageInMonths(birthDate, today);
  if (months === null) {
    return null;
  }
  if (months < 12) {
    return months === 1 ? '1 mês' : `${months} meses`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 ano' : `${years} anos`;
}

const AGE_YEARS = /^(\d+)\s*anos?$/i;
const AGE_MONTHS = /^(\d+)\s*m[eê]s(?:es)?$/i;
const AGE_BARE_NUMBER = /^(\d+)$/;

// Inverse of formatAge: turns free text like "4 anos" or "6 meses" back into an estimated
// birth date (today minus that much time). Returns null for anything it can't confidently
// parse — same "drop what we can't read" rule as parseBrazilianDate, since estimatedBirthDate
// is already an estimate and a bad guess is worse than leaving it unchanged.
export function parseAgeText(
  text: string,
  today: Date = new Date(),
): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const yearsMatch = AGE_YEARS.exec(trimmed) ?? AGE_BARE_NUMBER.exec(trimmed);
  if (yearsMatch) {
    return toIsoDate(subtract(today, 0, Number(yearsMatch[1])));
  }

  const monthsMatch = AGE_MONTHS.exec(trimmed);
  if (monthsMatch) {
    return toIsoDate(subtract(today, Number(monthsMatch[1]), 0));
  }

  return null;
}

function subtract(date: Date, months: number, years: number): Date {
  return new Date(
    date.getFullYear() - years,
    date.getMonth() - months,
    date.getDate(),
  );
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
