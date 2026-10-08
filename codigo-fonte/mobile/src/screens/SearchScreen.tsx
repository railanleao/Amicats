import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from '../components';
import { countCatsInRoom, listCats } from '../services/catService';
import { searchRooms } from '../services/roomService';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import { GENERAL_STATUS_LABELS, GENERAL_STATUS_TONE } from '../types/cat';
import type { Room } from '../types/room';
import { styles } from './SearchScreen.styles';

const SEARCH_DEBOUNCE_MS = 300;

type ResultTab = 'all' | 'cats' | 'rooms';

interface SearchResult {
  type: 'cat' | 'room';
  id: number;
  title: string;
  subtitle: string;
  cat?: Cat;
}

const TABS: { value: ResultTab; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'cats', label: 'Gatos' },
  { value: 'rooms', label: 'Salas' },
];

function roomLabel(cat: Cat): string {
  if (cat.roomTitle) {
    return cat.roomTitle;
  }
  return cat.generalStatus === 'TemporaryHome' ? 'Lar temporário' : '—';
}

function occupancyLabel(room: Room, occupancy: number | undefined): string {
  if (occupancy === undefined) {
    return 'Sala';
  }
  return room.maxCapacity != null
    ? `Sala · ${occupancy}/${room.maxCapacity} ocupada`
    : `Sala · ${occupancy} ${occupancy === 1 ? 'gato' : 'gatos'}`;
}

interface SearchScreenProps {
  onOpenCat: (catId: number) => void;
}

export function SearchScreen({ onOpenCat }: SearchScreenProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('all');
  const [cats, setCats] = useState<Cat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearchTerm(trimmed);

      if (trimmed) {
        setLoading(true);
      } else {
        setCats([]);
        setRooms([]);
        setRoomOccupancy({});
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    let cancelled = false;

    Promise.allSettled([listCats({ search: searchTerm }), searchRooms(searchTerm)]).then(([catsResult, roomsResult]) => {
      if (cancelled) {
        return;
      }

      const catsList = catsResult.status === 'fulfilled' ? catsResult.value : [];
      const roomsList = roomsResult.status === 'fulfilled' ? roomsResult.value : [];

      setCats(catsList);
      setRooms(roomsList);
      setRoomOccupancy({});
      setLoading(false);

      if (roomsList.length > 0) {
        Promise.all(roomsList.map((room) => countCatsInRoom(room.id).catch(() => 0))).then((counts) => {
          if (cancelled) {
            return;
          }
          const occupancy: Record<number, number> = {};
          roomsList.forEach((room, index) => {
            occupancy[room.id] = counts[index];
          });
          setRoomOccupancy(occupancy);
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  const catResults: SearchResult[] = cats.map((cat) => ({
    type: 'cat',
    id: cat.id,
    title: cat.name,
    subtitle: `Gato · ${roomLabel(cat)}`,
    cat,
  }));

  const roomResults: SearchResult[] = rooms.map((room) => ({
    type: 'room',
    id: room.id,
    title: room.title,
    subtitle: occupancyLabel(room, roomOccupancy[room.id]),
  }));

  const results: SearchResult[] = activeTab === 'cats' ? catResults : activeTab === 'rooms' ? roomResults : [...catResults, ...roomResults];

  function onSearch(text: string): void {
    setSearchInput(text);
  }

  function openResult(result: SearchResult): void {
    if (result.type === 'cat') {
      onOpenCat(result.id);
    }
    // Rooms have no dedicated mobile screen yet — not navigable.
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Busca</Text>

        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar gatos, salas…"
              placeholderTextColor={colors.inkFaint}
              value={searchInput}
              onChangeText={onSearch}
            />
          </View>

          <TouchableOpacity style={styles.filterButton} accessibilityRole="button" accessibilityLabel="Filtros">
            <Ionicons name="options-outline" size={18} color={colors.inkSoft} />
          </TouchableOpacity>
        </View>

        {searchTerm ? (
          <>
            <View style={styles.chipsRow}>
              {TABS.map((tab) => {
                const isActive = tab.value === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[styles.chip, isActive ? styles.chipActive : null]}
                    onPress={() => setActiveTab(tab.value)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loading && results.length === 0 ? (
              <View style={styles.feedback}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : results.length === 0 ? (
              <View style={styles.feedback}>
                <Text style={styles.feedbackText}>Nenhum resultado encontrado.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {results.map((result) => {
                  const content = (
                    <>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle}>{result.title}</Text>
                        <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                      </View>

                      {result.cat?.generalStatus && (
                        <StatusBadge
                          label={GENERAL_STATUS_LABELS[result.cat.generalStatus]}
                          tone={GENERAL_STATUS_TONE[result.cat.generalStatus]}
                        />
                      )}
                    </>
                  );

                  return result.type === 'cat' ? (
                    <TouchableOpacity
                      key={`${result.type}-${result.id}`}
                      style={styles.resultCard}
                      onPress={() => openResult(result)}
                      accessibilityRole="button"
                    >
                      {content}
                    </TouchableOpacity>
                  ) : (
                    <View key={`${result.type}-${result.id}`} style={styles.resultCard}>
                      {content}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>Digite algo para buscar gatos e salas.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
