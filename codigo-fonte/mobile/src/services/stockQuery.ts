import type { StockStatus } from '../types/stock';

export interface StockListParams {
  search?: string;
  category?: string;
  status?: StockStatus;
  expirationFrom?: string;
  expirationTo?: string;
  page?: number;
  size?: number;
}

export function buildStockQuery(params: StockListParams): string {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  if (params.category) {
    query.set('category', params.category);
  }

  if (params.status) {
    query.set('status', params.status);
  }

  if (params.expirationFrom) {
    query.set('expirationFrom', params.expirationFrom);
  }

  if (params.expirationTo) {
    query.set('expirationTo', params.expirationTo);
  }

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));

  return query.toString();
}
