import type { StockEntryOrigin } from '../types/stock';

import {
  STOCK_CATEGORIES,
  STOCK_ENTRY_ORIGIN_LABELS,
} from '../types/stock';

import {
  formatBrazilianDate,
  parseBrazilianDate,
} from '../utils/date';

export interface StockEntryFormValues {
  stockItemId: string | null;
  newItemCategory: string | null;
  origin: StockEntryOrigin | null;
  donorName: string;
  quantity: string;
  entryDate: string;
  expirationDate: string;
}

function localIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const TODAY_ISO = localIsoDate();

export const STOCK_ENTRY_DEFAULT_VALUES: StockEntryFormValues = {
  stockItemId: null,
  newItemCategory: null,
  origin: null,
  donorName: '',
  quantity: '',
  entryDate: formatBrazilianDate(TODAY_ISO),
  expirationDate: '',
};

export const STOCK_ENTRY_ORIGIN_OPTIONS = Object.entries(
  STOCK_ENTRY_ORIGIN_LABELS,
).map(([value, label]) => ({
  value,
  label,
}));

export const STOCK_CATEGORY_OPTIONS = STOCK_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

export function validateStockQuantity(value: string): true | string {
  const quantity = Number(value.replace(',', '.'));

  return (
    (Number.isFinite(quantity) && quantity > 0) ||
    'A quantidade deve ser maior que zero.'
  );
}

export function validateStockEntryDate(value: string): true | string {
  const parsed = parseBrazilianDate(value);

  if (!parsed) {
    return 'Informe uma data válida.';
  }

  if (parsed > TODAY_ISO) {
    return 'A data de entrada não pode ser futura.';
  }

  return true;
}

export function validateStockExpirationDate(
  value: string,
  entryDate: string,
): true | string {
  if (!value) {
    return true;
  }

  const expiration = parseBrazilianDate(value);

  if (!expiration) {
    return 'Informe uma data válida.';
  }

  const entry = parseBrazilianDate(entryDate);

  if (entry && expiration < entry) {
    return 'A validade não pode ser anterior à data de entrada.';
  }

  return true;
}
