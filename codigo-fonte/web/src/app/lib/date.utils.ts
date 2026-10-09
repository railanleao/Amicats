export function formatExpirationDate(
  expirationDate: string | null,
): string {
  if (!expirationDate) {
    return '—';
  }

  const [year, month] = expirationDate.split('-');

  return `${month}/${year}`;
}
