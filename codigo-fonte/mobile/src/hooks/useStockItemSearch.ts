import { useEffect, useState } from 'react';

import { listStock } from '../services/stockService';
import type { StockItem } from '../types/stock';

const SEARCH_DEBOUNCE_MS = 300;

export function useStockItemSearch() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [knownStockItems, setKnownStockItems] = useState<StockItem[]>([]);
  const [itemSearchInput, setItemSearchInput] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setItemSearchTerm(itemSearchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [itemSearchInput]);

  useEffect(() => {
    let cancelled = false;

    listStock({
      search: itemSearchTerm || undefined,
      page: 0,
      size: 20,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setStockItems(result.content);

        setKnownStockItems((current) => {
          const itemsById = new Map(
            current.map((item) => [item.id, item]),
          );

          result.content.forEach((item) => {
            itemsById.set(item.id, item);
          });

          return Array.from(itemsById.values());
        });
      })
      .catch(() => {
        if (!cancelled) {
          setItemsError(
            'Não foi possível carregar os itens do estoque.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingItems(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [itemSearchTerm]);

  function changeSearchInput(text: string): void {
    setItemSearchInput(text);
    setLoadingItems(true);
    setItemsError(undefined);
  }

  function addStockItem(item: StockItem): void {
    setStockItems((current) => [...current, item]);
  }

  return {
    stockItems,
    knownStockItems,
    itemSearchInput,
    itemSearchTerm,
    loadingItems,
    itemsError,
    changeSearchInput,
    addStockItem,
  };
}
