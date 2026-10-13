import { StockEntryDetailsSection } from './StockEntryDetailsSection';
import { StockEntryItemSection } from './StockEntryItemSection';
import { useStockItemSearch } from '../hooks/useStockItemSearch';
import { StockEntryCurrentItemCard } from './StockEntryCurrentItemCard';
import { buildNewStockItemRequest } from '../utils/stock';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  KeyboardAwareScrollView,
} from '../components';
import { Text } from '../components/Text';
import {
  createStockItem,
  listStock,
} from '../services/stockService';
import { stockRepository } from '../sync/runtime';
import { useSync } from '../sync/SyncContext';
import { colors } from '../theme/colors';
import type {
  CreateStockEntryRequest,
} from '../types/stock';
import { parseBrazilianDate } from '../utils/date';
import {
  STOCK_ENTRY_DEFAULT_VALUES,
  type StockEntryFormValues,
} from './stockEntryForm';
import { styles } from './StockEntryScreen.styles';

interface StockEntryScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

export function StockEntryScreen({
  onBack,
  onSaved,
}: StockEntryScreenProps) {
  const {
    stockItems,
    knownStockItems,
    itemSearchInput,
    itemSearchTerm,
    loadingItems,
    itemsError,
    changeSearchInput,
    addStockItem,
  } = useStockItemSearch();
  const { userId, online, syncNow } = useSync();
  const [creatingNewItem, setCreatingNewItem] = useState(false);
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StockEntryFormValues>({
    defaultValues: STOCK_ENTRY_DEFAULT_VALUES,
  });

const selectedStockItemId = useWatch({
  control,
  name: 'stockItemId',
  defaultValue: null,
});

const selectedStockItem = selectedStockItemId
  ? knownStockItems.find(
      (item) => item.id === Number(selectedStockItemId),
    ) ?? null
  : null;

  async function submit(values: StockEntryFormValues): Promise<void> {
    setGeneralError(undefined);

    if (userId === null) {
      setGeneralError('Sessão expirada. Entre novamente.');
      return;
    }

    if (!values.origin) {
      setGeneralError('Selecione a origem.');
      return;
    }

    const parsedEntryDate = parseBrazilianDate(values.entryDate);
    const parsedExpirationDate = values.expirationDate
      ? parseBrazilianDate(values.expirationDate)
      : null;

    if (!parsedEntryDate) {
      setGeneralError('Informe uma data de entrada válida.');
      return;
    }

    const quantity = Number(values.quantity.replace(',', '.'));

    setSubmitting(true);

    try {
      let stockItem = stockItems.find(
        (item) => item.id === Number(values.stockItemId),
      );

      if (creatingNewItem) {
        if (
          !trimmedItemName ||
          !values.newItemCategory ||
          !values.newItemUnit.trim()
        ) {
          setGeneralError(
            'Informe o nome, a categoria e a unidade do novo medicamento.',
          );
          return;
        }

        if (!online) {
          setGeneralError(
            'É necessário estar online para cadastrar um novo medicamento.',
          );
          return;
        }

        let exactExistingItem;

        try {
          const result = await listStock({
            search: trimmedItemName,
            page: 0,
            size: 20,
          });

          exactExistingItem = result.content.find(
            (item) =>
              item.name.trim().toLocaleLowerCase('pt-BR') ===
              trimmedItemName.toLocaleLowerCase('pt-BR'),
          );
        } catch {
          setGeneralError(
            'Não foi possível verificar se o medicamento já existe. Tente novamente.',
          );
          return;
        }

        if (exactExistingItem) {
          stockItem = exactExistingItem;
        } else {
          try {
            stockItem = await createStockItem(
              buildNewStockItemRequest(
                trimmedItemName,
                values.newItemCategory,
                values.newItemUnit,
              ),
            );
          } catch {
            setGeneralError(
              'Não foi possível cadastrar o novo medicamento. Verifique sua conexão e tente novamente.',
            );
            return;
          }
        }

        addStockItem(stockItem);
        setValue('stockItemId', String(stockItem.id));
        setCreatingNewItem(false);
        }

      if (!stockItem) {
        setGeneralError('Selecione um item do estoque.');
        return;
      }

      const request: CreateStockEntryRequest = {
        stockItemId: stockItem.id,
        origin: values.origin,
        donorName:
          values.origin === 'DONATED'
            ? values.donorName.trim() || null
            : null,
        quantity,
        entryDate: parsedEntryDate,
        expirationDate: parsedExpirationDate,
      };

     await stockRepository.createStockEntry(
       userId,
       stockItem.name,
       request,
     );

     if (online) {
       await syncNow();
     }

     onSaved();

    } catch {
      setGeneralError(
        'Não foi possível registrar a entrada de estoque. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

function handleItemSearchChange(text: string): void {
  changeSearchInput(text);
  setCreatingNewItem(false);
  setValue('stockItemId', null);
  setValue('newItemCategory', null);
  setValue('newItemUnit', '');
}

const trimmedItemName = itemSearchInput.trim();

const hasExactItemMatch = knownStockItems.some(
  (item) =>
    item.name.trim().toLocaleLowerCase('pt-BR') ===
    trimmedItemName.toLocaleLowerCase('pt-BR'),
);

const searchIsSettled = trimmedItemName === itemSearchTerm;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.ink}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Registrar entrada de estoque
        </Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
      >
        {loadingItems ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>
              Carregando estoque...
            </Text>
          </View>
        ) : null}

        <StockEntryItemSection
          control={control}
          errors={errors}
          stockItems={stockItems}
          itemSearchInput={itemSearchInput}
          trimmedItemName={trimmedItemName}
          searchIsSettled={searchIsSettled}
          loadingItems={loadingItems}
          itemsError={itemsError}
          hasExactItemMatch={hasExactItemMatch}
          creatingNewItem={creatingNewItem}
          onSearchChange={handleItemSearchChange}
          onStartCreating={() => {
            setCreatingNewItem(true);
            setValue('stockItemId', null);
          }}
          onSelectExistingItem={() => {
            setCreatingNewItem(false);
          }}
        />

        {selectedStockItem && !creatingNewItem ? (
          <StockEntryCurrentItemCard item={selectedStockItem} />
        ) : null}

        <StockEntryDetailsSection
          control={control}
          errors={errors}
        />

        {generalError ? (
          <Text style={styles.generalError}>
            {generalError}
          </Text>
        ) : null}
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <Button
          variant="outline"
          title="Cancelar"
          onPress={onBack}
          style={styles.footerButton}
        />

        <Button
          title="Registrar entrada"
          onPress={handleSubmit(submit)}
          loading={submitting}
          style={styles.footerButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
