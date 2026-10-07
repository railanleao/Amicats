const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;

export function parseServerDateTime(value: string): Date {
  return new Date(HAS_OFFSET.test(value) ? value : `${value}Z`);
}
