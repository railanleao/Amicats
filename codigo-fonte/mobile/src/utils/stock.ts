import type { CreateStockItemRequest } from '../types/stock';

export function buildNewStockItemRequest(
  name: string,
  category: string,
  unit: string,
): CreateStockItemRequest {
  return {
    name: name.trim(),
    category,
    quantity: 0,
    unit: unit.trim(),
    notes: null,
  };
}
