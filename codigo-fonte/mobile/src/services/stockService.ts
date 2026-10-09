import { apiRequest } from './api';
import type { PagedResult } from '../types/common';
import type { StockItem } from '../types/stock';
import { MEDICATION_CATEGORY } from '../types/stock';

// For the Home screen's low-stock banner: prefers an out-of-stock item over a merely low one,
// since that's the more urgent thing to show. Returns null when nothing needs attention.
export async function findMostUrgentStockItem(): Promise<StockItem | null> {
  const outOfStock = await apiRequest<PagedResult<StockItem>>('/stock?status=OutOfStock&page=0&size=1');
  if (outOfStock.content.length > 0) {
    return outOfStock.content[0];
  }

  const low = await apiRequest<PagedResult<StockItem>>('/stock?status=Low&page=0&size=1');
  return low.content[0] ?? null;
}

export async function searchMedications(search: string): Promise<StockItem[]> {
  const query = new URLSearchParams({ category: MEDICATION_CATEGORY, page: '0', size: '8' });
  if (search) {
    query.set('search', search);
  }

  const result = await apiRequest<PagedResult<StockItem>>(`/stock?${query.toString()}`);
  return result.content;
}
