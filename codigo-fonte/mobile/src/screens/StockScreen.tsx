import {
  QUICK_FILTERS,
  useStockList,
} from '../hooks/useStockList';
import { StockItemCard } from './StockItemCard';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { colors } from '../theme/colors';
import { styles } from './StockScreen.styles';

interface StockScreenProps {
  canManageStock: boolean;
  onBack: () => void;
  onRegisterEntry: () => void;
}

export function StockScreen({
  canManageStock,
  onBack,
  onRegisterEntry,
}: StockScreenProps) {

  const [showFilters, setShowFilters] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const {
    searchInput,
    setSearchInput,
    activeFilter,
    selectFilter,
    items,
    loading,
    errorMessage,
    retry,
  } = useStockList();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
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

          <Text style={styles.title}>Estoque</Text>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.inkFaint}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar item do estoque..."
              placeholderTextColor={colors.inkFaint}
              value={searchInput}
              onChangeText={setSearchInput}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel="Filtros"
            accessibilityState={{ expanded: showFilters }}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={colors.inkSoft}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.chipsRow}>
            {QUICK_FILTERS.map((filter) => {
              const isActive = filter.value === activeFilter;

              return (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.chip,
                    isActive ? styles.chipActive : null,
                  ]}
                  onPress={() => selectFilter(filter.value)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive ? styles.chipTextActive : null,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {canManageStock && (
          <Button
            title="Registrar entrada"
            onPress={onRegisterEntry}
          />
        )}

        {errorMessage ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{errorMessage}</Text>

            <Button
              variant="outline"
              title="Tentar novamente"
              onPress={retry}
              style={styles.retryButton}
            />
          </View>
        ) : loading && items.length === 0 ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>
              Nenhum item encontrado.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <StockItemCard
                key={item.id}
                item={item}
                expanded={expandedItemId === item.id}
                onToggle={() =>
                  setExpandedItemId((current) =>
                    current === item.id ? null : item.id,
                  )
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
