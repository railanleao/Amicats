export function formatLongDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(
    date,
  );
  const day = new Intl.DateTimeFormat("pt-BR", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    date,
  );

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${day} de ${month}`;
}
