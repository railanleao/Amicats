import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, StatusBadge } from '../components';
import { ApiError } from '../services/api';
import { catPhotoSource, listCats } from '../services/catService';
import { colors } from '../theme/colors';
import type { Cat, GeneralStatus } from '../types/cat';
import { GENERAL_STATUS_LABELS, GENERAL_STATUS_TONE, SEX_LABELS } from '../types/cat';
import { styles } from './CatsScreen.styles';

const SEARCH_DEBOUNCE_MS = 300;

type QuickFilter = 'All' | Extract<GeneralStatus, 'AvailableForAdoption' | 'UnderTreatment'>;

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'All', label: 'Todos' },
  { value: 'AvailableForAdoption', label: 'Disponíveis' },
  { value: 'UnderTreatment', label: 'Em tratamento' },
];

function roomLabel(cat: Cat): string {
  if (cat.roomTitle) {
    return cat.roomTitle;
  }
  return cat.generalStatus === 'TemporaryHome' ? 'Lar temporário' : '—';
}

function CatAvatar({ cat }: { cat: Cat }) {
  if (!cat.photoUrl) {
    return <View style={styles.avatar} />;
  }

  return (
    <View style={styles.avatar}>
      <Image source={catPhotoSource(cat.id)} style={styles.avatarImage} />
    </View>
  );
}

function CatRow({ cat }: { cat: Cat }) {
  const sexLabel = cat.sex ? SEX_LABELS[cat.sex] : '—';

  return (
    <View style={styles.catRow}>
      <CatAvatar cat={cat} />
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{cat.name}</Text>
        <Text style={styles.catSubtitle}>
          {sexLabel} · {roomLabel(cat)}
        </Text>
      </View>
      {cat.generalStatus && (
        <StatusBadge
          label={GENERAL_STATUS_LABELS[cat.generalStatus]}
          tone={GENERAL_STATUS_TONE[cat.generalStatus]}
        />
      )}
    </View>
  );
}

export function CatsScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('All');
  const [cats, setCats] = useState<Cat[]>([]);
  // Starts true so the initial fetch shows a spinner without setting state
  // synchronously from inside the effect below (see the retry/filter/search
  // handlers, which set it back to true right before each subsequent fetch).
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

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

    listCats({
      search: searchTerm || undefined,
      generalStatus: activeFilter === 'All' ? undefined : activeFilter,
    })
      .then((result) => {
        if (!cancelled) {
          setCats(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiError ? error.message : 'Não foi possível carregar os gatos. Tente novamente.',
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
  }, [searchTerm, activeFilter, reloadToken]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gatos</Text>

      <View style={styles.toolbar}>
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

        <TouchableOpacity style={styles.filterButton} accessibilityRole="button" accessibilityLabel="Filtros">
          <Ionicons name="options-outline" size={18} color={colors.inkSoft} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipsRow}>
        {QUICK_FILTERS.map((filter) => {
          const isActive = filter.value === activeFilter;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.chip, isActive ? styles.chipActive : null]}
              onPress={() => {
                setActiveFilter(filter.value);
                setLoading(true);
                setErrorMessage(null);
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {errorMessage ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{errorMessage}</Text>
          <Button
            variant="outline"
            title="Tentar novamente"
            onPress={() => {
              setReloadToken((token) => token + 1);
              setLoading(true);
              setErrorMessage(null);
            }}
            style={styles.retryButton}
          />
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
            <CatRow key={cat.id} cat={cat} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
