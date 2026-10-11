import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { catRepository } from '../sync/runtime';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import { SEX_LABELS } from '../types/cat';
import { styles } from './SelectCatScreen.styles';

const SEARCH_DEBOUNCE_MS = 300;

interface SelectCatScreenProps {
  title: string;
  hint: string;
  onBack: () => void;
  onSelectCat: (catId: number) => void;
}

function catSubtitle(cat: Cat): string {
  const sexLabel = cat.sex ? SEX_LABELS[cat.sex] : '—';
  return `${sexLabel} · ${cat.roomTitle ?? 'Sem sala'}`;
}

// A stripped-down version of CatsScreen's list (no status filters — just search and pick) used
// wherever a flow needs "choose a cat, then do X" (new prescription, transfer room) instead of
// drilling in through the cat's own detail screen first.
export function SelectCatScreen({ title, hint, onBack, onSelectCat }: SelectCatScreenProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setLoading(true);
      setErrorMessage(null);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    catRepository
      .listCats({ search: searchTerm || undefined })
      .then((result) => {
        if (!cancelled) {
          setCats(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Não foi possível carregar os gatos. Tente novamente.');
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
  }, [searchTerm]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>{hint}</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou microchip…"
            placeholderTextColor={colors.inkFaint}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>

        {errorMessage ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{errorMessage}</Text>
          </View>
        ) : loading && cats.length === 0 ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : cats.length === 0 ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Nenhum gato encontrado.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {cats.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catRow}
                onPress={() => onSelectCat(cat.id)}
                accessibilityRole="button"
              >
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catSubtitle}>{catSubtitle(cat)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
