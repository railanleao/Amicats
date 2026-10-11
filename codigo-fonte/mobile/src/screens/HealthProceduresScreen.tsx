import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, StatusBadge } from '../components';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { listHealthProcedures } from '../services/healthProcedureService';
import { colors } from '../theme/colors';
import type { HealthProcedure, HealthProcedureStatus, HealthProcedureType } from '../types/healthProcedure';
import { HEALTH_PROCEDURE_TYPE_LABELS } from '../types/healthProcedure';
import {
  healthProcedureDateLabel,
  healthProcedureName,
  healthProcedureStatusLabel,
  healthProcedureTone,
} from '../utils/healthProcedure';
import { styles } from './HealthProceduresScreen.styles';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;

type TypeFilter = 'All' | HealthProcedureType;

const STATUS_TABS: { value: HealthProcedureStatus; label: string }[] = [
  { value: 'Scheduled', label: 'Agendados' },
  { value: 'Completed', label: 'Realizados' },
  { value: 'Cancelled', label: 'Cancelados' },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'All', label: 'Todos' },
  { value: 'Vaccine', label: 'Vacinas' },
  { value: 'Deworming', label: 'Vermífugos' },
  { value: 'Neutering', label: 'Castrações' },
];

function ProcedureRow({ procedure, showCat, onPress }: { procedure: HealthProcedure; showCat: boolean; onPress: () => void }) {
  const typeLabel = HEALTH_PROCEDURE_TYPE_LABELS[procedure.type];
  const title = showCat ? procedure.catName : healthProcedureName(procedure);
  const subtitle = showCat && procedure.name ? `${typeLabel} · ${procedure.name}` : typeLabel;
  const datePrefix = procedure.status === 'Completed' ? 'Realizado em' : 'Agendado para';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowTopLine}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <StatusBadge label={healthProcedureStatusLabel(procedure)} tone={healthProcedureTone(procedure)} />
      </View>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
      <Text style={styles.rowSubtitle}>
        {datePrefix} {healthProcedureDateLabel(procedure)}
      </Text>
    </TouchableOpacity>
  );
}

interface HealthProceduresScreenProps {
  catId?: number;
  catName?: string;
  canManage: boolean;
  onBack: () => void;
  onOpenProcedure: (procedureId: number) => void;
  onNewProcedure: (catId?: number) => void;
}

export function HealthProceduresScreen({ catId, catName, canManage, onBack, onOpenProcedure, onNewProcedure }: HealthProceduresScreenProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<HealthProcedureStatus>('Scheduled');
  const [type, setType] = useState<TypeFilter>('All');
  const [procedures, setProcedures] = useState<HealthProcedure[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showCat = catId === undefined;

  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchPage = useCallback(
    (pageToLoad: number) =>
      listHealthProcedures({
        search: searchTerm || undefined,
        catId,
        type: type === 'All' ? undefined : type,
        status,
        page: pageToLoad,
        size: PAGE_SIZE,
      }),
    [searchTerm, catId, type, status],
  );

  const loadFirstPage = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    fetchPage(0)
      .then((result) => {
        if (!cancelled) {
          setProcedures(result.content);
          setPage(0);
          setTotalElements(result.totalElements);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Não foi possível carregar os agendamentos. Verifique a conexão.');
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
  }, [fetchPage]);

  useFocusEffect(loadFirstPage);

  function loadMore() {
    setLoadingMore(true);
    fetchPage(page + 1)
      .then((result) => {
        setProcedures((current) => [...current, ...result.content]);
        setPage(result.page);
        setTotalElements(result.totalElements);
      })
      .catch(() => setErrorMessage('Não foi possível carregar mais agendamentos. Verifique a conexão.'))
      .finally(() => setLoadingMore(false));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {catName ? `Saúde — ${catName}` : 'Saúde'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder={showCat ? 'Buscar por gato ou procedimento…' : 'Buscar por procedimento…'}
            placeholderTextColor={colors.inkFaint}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>

        <View style={styles.tabs}>
          {STATUS_TABS.map((tab) => {
            const isActive = tab.value === status;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tab, isActive ? styles.tabActive : null]}
                onPress={() => setStatus(tab.value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.chipsRow}>
          {TYPE_FILTERS.map((filter) => {
            const isActive = filter.value === type;
            return (
              <TouchableOpacity
                key={filter.value}
                style={[styles.chip, isActive ? styles.chipActive : null]}
                onPress={() => setType(filter.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
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
              onPress={loadFirstPage}
              style={styles.retryButton}
            />
          </View>
        ) : loading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : procedures.length === 0 ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Nenhum agendamento encontrado.</Text>
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {procedures.map((procedure) => (
                <ProcedureRow
                  key={procedure.id}
                  procedure={procedure}
                  showCat={showCat}
                  onPress={() => onOpenProcedure(procedure.id)}
                />
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Mostrando {procedures.length} de {totalElements}
              </Text>
              {procedures.length < totalElements &&
                (loadingMore ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <TouchableOpacity onPress={loadMore} accessibilityRole="button">
                    <Text style={styles.loadMore}>Carregar mais</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </>
        )}
      </ScrollView>

      {canManage && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => onNewProcedure(catId)}
          accessibilityRole="button"
          accessibilityLabel="Novo agendamento"
        >
          <Ionicons name="add" size={28} color={colors.onPrimary} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
