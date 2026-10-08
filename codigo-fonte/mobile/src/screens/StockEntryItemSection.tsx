import type {
  Control,
  FieldErrors,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';

import {
  Button,
  SelectField,
  TextField,
} from '../components';
import { Text } from '../components/Text';
import type { StockItem } from '../types/stock';

import {
  STOCK_CATEGORY_OPTIONS,
  type StockEntryFormValues,
} from './stockEntryForm';

interface StockEntryItemSectionProps {
  control: Control<StockEntryFormValues>;
  errors: FieldErrors<StockEntryFormValues>;
  stockItems: StockItem[];
  itemSearchInput: string;
  trimmedItemName: string;
  searchIsSettled: boolean;
  loadingItems: boolean;
  itemsError?: string;
  hasExactItemMatch: boolean;
  creatingNewItem: boolean;
  onSearchChange: (text: string) => void;
  onStartCreating: () => void;
  onSelectExistingItem: () => void;
}

export function StockEntryItemSection({
  control,
  errors,
  stockItems,
  itemSearchInput,
  trimmedItemName,
  searchIsSettled,
  loadingItems,
  itemsError,
  hasExactItemMatch,
  creatingNewItem,
  onSearchChange,
  onStartCreating,
  onSelectExistingItem,
}: StockEntryItemSectionProps) {
  return (
    <>
      <TextField
        label="Medicamento"
        placeholder="Digite o nome do medicamento"
        value={itemSearchInput}
        onChangeText={onSearchChange}
      />

      {trimmedItemName &&
        searchIsSettled &&
        !loadingItems &&
        !itemsError &&
        !hasExactItemMatch &&
        !creatingNewItem && (
          <Button
            variant="outline"
            title={`+ Cadastrar "${trimmedItemName}" como novo medicamento`}
            onPress={onStartCreating}
          />
        )}

      <Controller
        control={control}
        name="stockItemId"
        rules={{
          validate: (value) =>
            creatingNewItem ||
            Boolean(value) ||
            'Selecione um item do estoque.',
        }}
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Item do estoque"
            value={value}
            placeholder="Selecione"
            options={stockItems.map((item) => ({
              label: item.name,
              value: String(item.id),
            }))}
            onChange={(selected) => {
              onChange(selected);
              onSelectExistingItem();
            }}
            error={errors.stockItemId?.message ?? itemsError}
          />
        )}
      />

      {creatingNewItem ? (
        <>
          <Text>
            Novo medicamento: {trimmedItemName}
          </Text>

          <Controller
            control={control}
            name="newItemCategory"
            rules={{
              validate: (value) =>
                !creatingNewItem ||
                Boolean(value) ||
                'Selecione a categoria.',
            }}
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Categoria"
                value={value}
                placeholder="Selecione"
                options={STOCK_CATEGORY_OPTIONS}
                onChange={onChange}
                error={errors.newItemCategory?.message}
              />
            )}
          />
        </>
      ) : null}
    </>
  );
}
