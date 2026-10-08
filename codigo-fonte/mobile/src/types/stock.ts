// Mirrors the backend's StockItem domain (org.amicats.backend.domain.entity.StockItem and
// ReadStockItemOutput). `status` is derived server-side from `quantity`, not set by the client.
export type StockStatus = 'Normal' | 'Low' | 'OutOfStock';

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  Normal: 'Normal',
  Low: 'Baixo',
  OutOfStock: 'Em falta',
};

export const STOCK_STATUS_TONE: Record<
  StockStatus,
  'warning' | 'danger' | 'success' | 'sky' | 'neutral'
> = {
  Normal: 'success',
  Low: 'warning',
  OutOfStock: 'danger',
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

export interface CreateStockItemRequest {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
}

export const STOCK_CATEGORIES = [
  'Antibiótico',
  'Anti-inflamatório',
  'Antiparasitário',
  'Imunomodulador',
  'Vacina',
  'Nutrição',
  'Insumo',
] as const;


export type StockEntryOrigin = 'DONATED' | 'PURCHASED';

export const STOCK_ENTRY_ORIGIN_LABELS: Record<StockEntryOrigin, string> = {
  DONATED: 'Doado',
  PURCHASED: 'Comprado',
};

export interface CreateStockEntryRequest {
  stockItemId: number;
  origin: StockEntryOrigin;
  donorName: string | null;
  quantity: number;
  entryDate: string;
  expirationDate: string | null;
}


