export type StockStatus = 'Normal' | 'Low' | 'OutOfStock';

export type StockOrigin = 'DONATED' | 'PURCHASED';

export interface StockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  status: StockStatus;
  expirationDate: string | null;
  unit: string;
  notes: string | null;
}

export interface StockItemSearchParams {
  search?: string;
  category?: string;
  status?: StockStatus;
  expirationFrom?: string;
  expirationTo?: string;
  page: number;
  size: number;
}

export interface CreateStockItemRequest {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
}

export interface UpdateStockItemRequest {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
}

export interface CreateStockEntryRequest {
  stockItemId: number;
  origin: StockOrigin;
  donorName: string | null;
  quantity: number;
  entryDate: string;
  expirationDate: string | null;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
