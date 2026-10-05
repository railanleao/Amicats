// Mirrors the backend's StockItem domain (org.amicats.backend.domain.entity.StockItem and
// ReadStockItemOutput). `status` is derived server-side from `quantity` (Normal/Low/OutOfStock),
// not something the client sets. `category` is a free-text string on the backend — there's no
// StockCategory enum to mirror here.
export type StockStatus = 'Normal' | 'Low' | 'OutOfStock';

export type StockOrigin = 'DONATED' | 'PURCHASED';
export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  Normal: 'Normal',
  Low: 'Baixo',
  OutOfStock: 'Em falta',
};

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

export interface StockSearchParams {
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
