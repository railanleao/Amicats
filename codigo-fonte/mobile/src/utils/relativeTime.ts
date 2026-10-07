export function formatRelativeTime(isoDate: string | null, now: Date): string {
  if (!isoDate) {
    return 'nunca';
  }

  const minutes = Math.floor((now.getTime() - new Date(isoDate).getTime()) / 60_000);

  if (minutes < 1) {
    return 'agora mesmo';
  }
  if (minutes < 60) {
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  const days = Math.floor(hours / 24);

  return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
}

export function formatClockTime(isoDate: string): string {
  const date = new Date(isoDate);

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
