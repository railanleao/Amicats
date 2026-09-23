export function formatLongDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  const day = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${day} de ${month}`;
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
