import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DoseCard, InfoBanner, SectionLabel } from '../components';
import { countCatsInRoom } from '../services/catService';
import { listActiveRooms } from '../services/roomService';
import { findMostUrgentStockItem } from '../services/stockService';
import { colors } from '../theme/colors';
import { formatLongDate } from '../utils/date';
import type { User } from '../types/auth';
import type { StockItem } from '../types/stock';
import { styles } from './HomeScreen.styles';

interface HomeScreenProps {
  user: User;
  onNewCat: () => void;
}

interface RoomOccupancy {
  id: number;
  name: string;
  occupied: number;
  capacity: number;
}

const MAX_ROOMS_SHOWN = 3;
// Matches the same threshold used on the web dashboard's occupancy card.
const HIGH_OCCUPANCY_THRESHOLD = 0.85;

// dados falsos até o registro de doses (RF-009) e os contatos (RF-003, RF-013) estarem
// implementados. O aviso de estoque baixo abaixo já usa o /stock real (ver useEffect).
const PENDING_DOSES = [
  {
    catName: 'Mia',
    medication: 'Amoxicilina 250mg',
    time: '12:00',
    dosage: '1 comprimido VO',
    status: 'pending' as const,
  },
  {
    catName: 'Zeca',
    medication: 'Meloxicam',
    time: '07:30',
    dosage: '0,3 ml VO',
    status: 'late' as const,
  },
];

const CONTACT_BANKS = [
  {
    icon: 'people-outline' as const,
    title: 'Banco de voluntários',
    subtitle: '18 ativos · transporte, cuidados e eventos',
  },
  {
    icon: 'business-outline' as const,
    title: 'Instituições parceiras',
    subtitle: '3 parceiras · clínicas, ONGs e transporte',
  },
];

function firstName(fullName: string): string {
  return fullName.split(' ')[0];
}

export function HomeScreen({ user, onNewCat }: HomeScreenProps) {
  const [urgentStockItem, setUrgentStockItem] = useState<StockItem | null>(null);
  const [roomOccupancy, setRoomOccupancy] = useState<RoomOccupancy[]>([]);

  useEffect(() => {
    findMostUrgentStockItem()
      .then(setUrgentStockItem)
      .catch(() => setUrgentStockItem(null));
  }, []);

  useEffect(() => {
    listActiveRooms()
      .then((rooms) => {
        const withCapacity = rooms.filter((room) => (room.maxCapacity ?? 0) > 0);
        return Promise.all(
          withCapacity.map((room) =>
            countCatsInRoom(room.id)
              .catch(() => 0)
              .then((occupied) => ({
                id: room.id,
                name: room.title,
                occupied,
                capacity: room.maxCapacity as number,
              })),
          ),
        );
      })
      .then((rooms) => {
        const sorted = [...rooms]
          .sort((a, b) => b.occupied / b.capacity - a.occupied / a.capacity)
          .slice(0, MAX_ROOMS_SHOWN);
        setRoomOccupancy(sorted);
      })
      .catch(() => setRoomOccupancy([]));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {firstName(user.fullName)}</Text>
          <Text style={styles.date}>{formatLongDate(new Date())}</Text>
        </View>

        <View style={styles.section}>
          <SectionLabel>Doses pendentes agora</SectionLabel>
          {PENDING_DOSES.map((dose) => (
            <DoseCard key={`${dose.catName}-${dose.medication}`} {...dose} />
          ))}
        </View>

        {urgentStockItem && (
          <InfoBanner
            icon="alert-circle-outline"
            text={`Estoque baixo — ${urgentStockItem.name}, ${urgentStockItem.quantity} ${urgentStockItem.unit}.`}
          />
        )}

        {roomOccupancy.length > 0 && (
          <View style={styles.section}>
            <SectionLabel>Ocupação das salas</SectionLabel>
            {roomOccupancy.map((room) => {
              const percent = Math.round((room.occupied / room.capacity) * 100);
              const isHigh = room.occupied / room.capacity >= HIGH_OCCUPANCY_THRESHOLD;
              return (
                <View key={room.id} style={styles.occupancyCard}>
                  <View style={styles.occupancyHeader}>
                    <Text style={styles.occupancyName}>{room.name}</Text>
                    <Text style={styles.occupancyCount}>
                      {room.occupied}/{room.capacity}
                    </Text>
                  </View>
                  <View style={styles.occupancyTrack}>
                    <View
                      style={[
                        styles.occupancyFill,
                        { width: `${percent}%`, backgroundColor: isHigh ? colors.warning : colors.primary },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <SectionLabel>Atalhos</SectionLabel>
          <TouchableOpacity style={styles.shortcutButton} onPress={onNewCat} accessibilityRole="button">
            <Text style={styles.shortcutText}>+ Novo gato</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutButton} accessibilityRole="button">
            <Text style={styles.shortcutText}>+ Nova prescrição</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionLabel>Bancos de contatos</SectionLabel>
          {CONTACT_BANKS.map((bank) => (
            <TouchableOpacity key={bank.title} style={styles.contactRow} accessibilityRole="button">
              <Ionicons name={bank.icon} size={20} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{bank.title}</Text>
                <Text style={styles.contactSubtitle}>{bank.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
