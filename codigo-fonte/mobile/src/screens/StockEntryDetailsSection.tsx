import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';

import {
  SelectField,
  TextField,
} from '../components';
import type { StockEntryOrigin } from '../types/stock';
import { maskBrazilianDate } from '../utils/date';

import {
  STOCK_ENTRY_DEFAULT_VALUES,
  STOCK_ENTRY_ORIGIN_OPTIONS,
  type StockEntryFormValues,
  validateStockEntryDate,
  validateStockExpirationDate,
  validateStockQuantity,
} from './stockEntryForm';

interface StockEntryDetailsSectionProps {
  control: Control<StockEntryFormValues>;
  errors: FieldErrors<StockEntryFormValues>;
}

export function StockEntryDetailsSection({
  control,
  errors,
}: StockEntryDetailsSectionProps) {
  const origin = useWatch({
    control,
    name: 'origin',
    defaultValue: null,
  });

  const entryDate = useWatch({
    control,
    name: 'entryDate',
    defaultValue: STOCK_ENTRY_DEFAULT_VALUES.entryDate,
  });

  return (
    <>
      <Controller
        control={control}
        name="origin"
        rules={{
          required: 'Selecione a origem.',
        }}
        render={({ field: { value, onChange } }) => (
          <SelectField
            label="Origem"
            value={value}
            placeholder="Selecione"
            options={STOCK_ENTRY_ORIGIN_OPTIONS}
            onChange={(selected) =>
              onChange(selected as StockEntryOrigin)
            }
            error={errors.origin?.message}
          />
        )}
      />

      {origin === 'DONATED' ? (
        <Controller
          control={control}
          name="donorName"
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Nome do doador"
              placeholder="Opcional"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      ) : null}

      <Controller
        control={control}
        name="quantity"
        rules={{
          required: 'Informe a quantidade.',
          validate: validateStockQuantity,
        }}
        render={({ field: { value, onChange } }) => (
          <TextField
            label="Quantidade"
            placeholder="Ex: 10"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            error={errors.quantity?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="entryDate"
        rules={{
          required: 'Informe a data de entrada.',
          validate: validateStockEntryDate,
        }}
        render={({ field: { value, onChange } }) => (
          <TextField
            label="Data de entrada"
            placeholder="dd/mm/aaaa"
            keyboardType="number-pad"
            maxLength={10}
            value={value}
            onChangeText={(text) =>
              onChange(maskBrazilianDate(text))
            }
            error={errors.entryDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="expirationDate"
        rules={{
          validate: (value) =>
            validateStockExpirationDate(value, entryDate),
        }}
        render={({ field: { value, onChange } }) => (
          <TextField
            label="Data de validade"
            placeholder="dd/mm/aaaa"
            keyboardType="number-pad"
            maxLength={10}
            value={value}
            onChangeText={(text) =>
              onChange(maskBrazilianDate(text))
            }
            error={errors.expirationDate?.message}
          />
        )}
      />
    </>
  );
}
