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
