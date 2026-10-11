import { apiRequest } from './api';
import type { PagedResult } from '../types/common';
import { MEDICATION_CATEGORY } from '../types/stock';
import type {
  CreateStockItemRequest,
  StockItem,
} from '../types/stock';

import {
  buildStockQuery,
  type StockListParams,
} from './stockQuery';



export function listStock(
  params: StockListParams = {},
): Promise<PagedResult<StockItem>> {
  return apiRequest<PagedResult<StockItem>>(
    `/stock?${buildStockQuery(params)}`,
  );
}

export function createStockItem(
  request: CreateStockItemRequest,
): Promise<StockItem> {
  return apiRequest<StockItem>('/stock', {
    method: 'POST',
    body: request,
  });
}

// For the Home screen's low-stock banner: prefers an out-of-stock item over a merely low one,
// since that's the more urgent thing to show. Returns null when nothing needs attention.
export async function findMostUrgentStockItem(): Promise<StockItem | null> {
  const outOfStock = await listStock({
    status: 'OutOfStock',
    page: 0,
    size: 1,
  });

  if (outOfStock.content.length > 0) {
    return outOfStock.content[0];
  }

  const low = await listStock({
    status: 'Low',
    page: 0,
    size: 1,
  });

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
