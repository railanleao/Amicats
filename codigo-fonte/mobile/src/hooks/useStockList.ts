import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { listStock } from '../services/stockService';
import type { StockItem, StockStatus } from '../types/stock';

const SEARCH_DEBOUNCE_MS = 300;

export type QuickFilter = 'All' | StockStatus;

export const QUICK_FILTERS: {
  value: QuickFilter;
  label: string;
}[] = [
  { value: 'All', label: 'Todos' },
  { value: 'OutOfStock', label: 'Em falta' },
  { value: 'Low', label: 'Baixo' },
  { value: 'Normal', label: 'Normal' },
];

export function useStockList() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<QuickFilter>('All');

  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setLoading(true);
      setErrorMessage(null);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setLoading(true);
      setErrorMessage(null);

      listStock({
        search: searchTerm || undefined,
        status:
          activeFilter === 'All'
            ? undefined
            : activeFilter,
        page: 0,
        size: 20,
      })
        .then((result) => {
          if (!cancelled) {
            setItems(result.content);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setErrorMessage(
              'Não foi possível carregar o estoque. Tente novamente.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
          // reloadToken is intentionally a dependency so retry can
          // force the focused screen to fetch the stock again.
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [searchTerm, activeFilter, reloadToken]),
      );

  function selectFilter(filter: QuickFilter): void {
    setActiveFilter(filter);
    setLoading(true);
    setErrorMessage(null);
  }

  function retry(): void {
    setReloadToken((token) => token + 1);
    setLoading(true);
    setErrorMessage(null);
  }

  return {
    searchInput,
    setSearchInput,
    activeFilter,
    selectFilter,
    items,
    loading,
    errorMessage,
    retry,
  };
}
