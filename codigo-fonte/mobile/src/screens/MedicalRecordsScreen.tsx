import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, CatAvatar, StatusBadge } from '../components';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { catRepository } from '../sync/runtime';
import { useSync } from '../sync/SyncContext';
import { colors } from '../theme/colors';
import type { Cat, GeneralStatus } from '../types/cat';
import { GENERAL_STATUS_LABELS, GENERAL_STATUS_TONE } from '../types/cat';
import { ageGroupLabel, roomLabel, testedExamBadges } from '../utils/medicalRecord';
import { styles } from './MedicalRecordsScreen.styles';

const SEARCH_DEBOUNCE_MS = 300;

type QuickFilter = 'All' | Extract<GeneralStatus, 'InClinic' | 'UnderTreatment' | 'InTriage'>;

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'All', label: 'Todos' },
  { value: 'InClinic', label: 'Em clínica' },
  { value: 'UnderTreatment', label: 'Em tratamento' },
  { value: 'InTriage', label: 'Em triagem' },
];

function recordSubtitle(cat: Cat): string {
  return [roomLabel(cat), ageGroupLabel(cat)].filter(Boolean).join(' · ');
}

function RecordRow({ cat, onPress }: { cat: Cat; onPress: () => void }) {
  const examBadges = testedExamBadges(cat);

  return (
    <TouchableOpacity style={styles.recordRow} onPress={onPress} accessibilityRole="button">
      <CatAvatar cat={cat} />
      <View style={styles.recordInfo}>
        <View style={styles.recordTopLine}>
          <Text style={styles.catName} numberOfLines={1}>
            {cat.name}
          </Text>
          {cat.generalStatus && (
            <StatusBadge label={GENERAL_STATUS_LABELS[cat.generalStatus]} tone={GENERAL_STATUS_TONE[cat.generalStatus]} />
          )}
        </View>
        <Text style={styles.catSubtitle}>{recordSubtitle(cat)}</Text>
        {examBadges.length > 0 && (
          <View style={styles.examRow}>
            {examBadges.map((badge) => (
              <StatusBadge key={badge.label} label={badge.label} tone={badge.tone} />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface MedicalRecordsScreenProps {
  onBack: () => void;
  onOpenRecord: (catId: number) => void;
}

export function MedicalRecordsScreen({ onBack, onOpenRecord }: MedicalRecordsScreenProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('All');
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const { dataVersion } = useSync();

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
      .listCats({
        search: searchTerm || undefined,
        generalStatus: activeFilter === 'All' ? undefined : activeFilter,
      })
      .then((result) => {
        if (!cancelled) {
          setCats(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Não foi possível carregar os prontuários. Tente novamente.');
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
  }, [searchTerm, activeFilter, reloadToken, dataVersion]);

  function selectFilter(filter: QuickFilter) {
    setActiveFilter(filter);
    setLoading(true);
    setErrorMessage(null);
  }

  function retry() {
    setReloadToken((token) => token + 1);
    setLoading(true);
    setErrorMessage(null);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prontuários</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome do gatinho…"
            placeholderTextColor={colors.inkFaint}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>

        <View style={styles.chipsRow}>
          {QUICK_FILTERS.map((filter) => {
            const isActive = filter.value === activeFilter;
            return (
              <TouchableOpacity
                key={filter.value}
                style={[styles.chip, isActive ? styles.chipActive : null]}
                onPress={() => selectFilter(filter.value)}
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
            <Button variant="outline" title="Tentar novamente" onPress={retry} style={styles.retryButton} />
          </View>
        ) : loading && cats.length === 0 ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : cats.length === 0 ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Nenhum prontuário encontrado.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {cats.map((cat) => (
              <RecordRow key={cat.id} cat={cat} onPress={() => onOpenRecord(cat.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
