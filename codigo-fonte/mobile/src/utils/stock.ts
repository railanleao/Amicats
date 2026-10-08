import type { CreateStockItemRequest } from '../types/stock';

export function buildNewStockItemRequest(
  name: string,
  category: string,
): CreateStockItemRequest {
  return {
    name: name.trim(),
    category,
    quantity: 0,
    unit: 'unidades',
    notes: null,
  };
}
