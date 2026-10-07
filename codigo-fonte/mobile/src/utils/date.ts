export function formatLongDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  const day = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${day} de ${month}`;
}

export function maskBrazilianDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

const BR_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

// The "Data de resgate" field on "Novo gato" is free text ("Ex: 08/12/2025"), but the backend
// expects an ISO LocalDate. Returns null for blank or unrecognized input — the field is optional
// and this isn't a masked input, so silently dropping what it can't parse is safer than a
// confusing 400 from the API for a typo.
export function parseBrazilianDate(value: string): string | null {
  const match = BR_DATE.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// The inverse of parseBrazilianDate, used to prefill the edit form's free-text date fields
// from the ISO LocalDate the API returns. Returns '' for null/blank so it drops straight into
// a text field's default value.
export function formatBrazilianDate(isoDate: string | null): string {
  if (!isoDate) {
    return '';
  }

  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

// Whole years between an ISO LocalDate (estimatedBirthDate) and today, matching how a person
// would state a cat's age ("4 anos") rather than exposing the day-level estimate.
export function calculateAgeYears(isoDate: string): number {
  // Built from the y/m/d parts rather than `new Date(isoDate)`: a date-only ISO string
  // parses as UTC midnight, which rolls back to the previous local day west of UTC and
  // silently throws the year-boundary comparison below off by one.
  const [year, month, day] = isoDate.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  return Math.max(age, 0);
}
