import { MEDICATION_CATEGORY } from './stock.model';

export const STOCK_CATEGORIES = [
  MEDICATION_CATEGORY,
  'Nutrição',
  'Insumo',
] as const;

export type StockCategory = (typeof STOCK_CATEGORIES)[number];
