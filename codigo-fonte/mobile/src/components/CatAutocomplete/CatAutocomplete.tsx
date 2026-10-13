import { useEffect, useState } from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { catRepository } from '../../sync/runtime';
import { colors } from '../../theme/colors';
import type { Cat } from '../../types/cat';
import { roomLabel } from '../../utils/medicalRecord';
import { Text } from '../Text';
import { TextInput } from '../TextInput';
import { styles } from './CatAutocomplete.styles';

const SEARCH_DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 8;

interface CatAutocompleteProps {
  value: string;
  selected: Cat | null;
  onChangeText: (text: string) => void;
  onSelect: (cat: Cat) => void;
  error?: string;
}

export function CatAutocomplete({ value, selected, onChangeText, onSelect, error }: CatAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Cat[]>([]);

  const term = value.trim();
  const hasSelection = selected !== null && selected.name === value;

  useEffect(() => {
    if (!focused || hasSelection || term === '') {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      catRepository
        .listCats({ search: term })
        .then((cats) => {
          if (!cancelled) {
            setSuggestions(cats.slice(0, SUGGESTION_LIMIT));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [term, focused, hasSelection]);

  const showSuggestions = focused && !hasSelection && term !== '' && suggestions.length > 0;

  function handleSelect(cat: Cat) {
    onSelect(cat);
    setSuggestions([]);
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gato</Text>
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          style={styles.input}
          placeholder="Busque pelo nome do gatinho"
          placeholderTextColor={colors.inkFaint}
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestions.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.suggestion} onPress={() => handleSelect(cat)} accessibilityRole="button">
              <Text style={styles.suggestionName} numberOfLines={1}>
                {cat.name}
              </Text>
              <Text style={styles.suggestionRoom}>{roomLabel(cat)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
