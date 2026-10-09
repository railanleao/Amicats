import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { searchMedications } from '../../services/stockService';
import { colors } from '../../theme/colors';
import type { StockItem } from '../../types/stock';
import { styles } from './MedicationAutocomplete.styles';

const SEARCH_DEBOUNCE_MS = 300;

interface MedicationAutocompleteProps {
  value: string;
  selected: StockItem | null;
  onChangeText: (text: string) => void;
  onSelect: (item: StockItem) => void;
  error?: string;
}

export function MedicationAutocomplete({
                                         value,
                                         selected,
                                         onChangeText,
                                         onSelect,
                                         error,
                                       }: MedicationAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  const term = value.trim();
  const hasSelection = selected !== null && selected.name === value;

  useEffect(() => {
    if (!focused || hasSelection) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      setLoading(true);
      searchMedications(term)
        .then((items) => {
          if (!cancelled) {
            setSuggestions(items);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [term, focused, hasSelection]);

  const showSuggestions = focused && !hasSelection && suggestions.length > 0;
  const isNewMedication = term !== '' && !hasSelection && !showSuggestions && !loading;

  function handleSelect(item: StockItem) {
    onSelect(item);
    setSuggestions([]);
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medicamento</Text>
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          style={styles.input}
          placeholder="Busque no estoque ou digite um novo"
          placeholderTextColor={colors.inkFaint}
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {loading && focused ? <ActivityIndicator size="small" color={colors.inkFaint} /> : null}
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestion}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
            >
              <Text style={styles.suggestionName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.suggestionStock,
                  item.status === 'OutOfStock' ? styles.suggestionStockEmpty : null,
                ]}
              >
                {item.quantity} {item.unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : isNewMedication ? (
        <Text style={styles.hint}>Não encontrado no estoque: será cadastrado com estoque zerado.</Text>
      ) : null}
    </View>
  );
}
