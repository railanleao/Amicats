export type StockStatus = 'Normal' | 'Low' | 'OutOfStock';

export const MEDICATION_CATEGORY = 'Medicamento';

export interface StockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
  status: StockStatus;
}

export interface StockSearchParams {
  search?: string;
  category?: string;
  page: number;
  size: number;
}
