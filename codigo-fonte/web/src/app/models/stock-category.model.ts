export const MEDICATION_CATEGORIES = [
  'Antibiótico',
  'Anti-inflamatório',
  'Antiparasitário',
  'Imunomodulador',
] as const;

export const STOCK_CATEGORIES = [
  ...MEDICATION_CATEGORIES,
  'Nutrição',
  'Insumo',
] as const;

export type StockCategory = (typeof STOCK_CATEGORIES)[number];
