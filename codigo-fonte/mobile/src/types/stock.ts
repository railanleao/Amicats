// Mirrors the backend's StockItem domain (org.amicats.backend.domain.entity.StockItem and
// ReadStockItemOutput). `status` is derived server-side from `quantity`, not set by the client.
export type StockStatus = 'Normal' | 'Low' | 'OutOfStock';

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
