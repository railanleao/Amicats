export function parseJsonBody<T>(text: string): T {
  return (text.trim() === '' ? undefined : JSON.parse(text)) as T;
}
