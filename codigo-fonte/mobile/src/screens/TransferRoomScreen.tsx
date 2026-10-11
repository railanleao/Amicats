import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components';
import { countCatsInRoom } from '../services/catService';
import { listActiveRooms } from '../services/roomService';
import { createRoomTransfer, listRoomTransfers } from '../services/roomTransferService';
import { catRepository } from '../sync/runtime';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import type { RoomTransfer } from '../types/roomTransfer';
import {
  canSubmitTransfer,
  currentRoomSubtitle,
  occupancySubtitle,
  transferDateTimeLabel,
  transferErrorMessage,
  transferFromLabel,
  type CurrentRoomInfo,
  type RoomOption,
} from './TransferRoomScreen.logic';
import { styles } from './TransferRoomScreen.styles';

interface TransferRoomScreenProps {
  catId: number;
  onBack: () => void;
  onTransferred: () => void;
}

export function TransferRoomScreen({ catId, onBack, onTransferred }: TransferRoomScreenProps) {
  const [cat, setCat] = useState<Cat | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<CurrentRoomInfo | null>(null);
  const [rooms, setRooms] = useState<RoomOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [history, setHistory] = useState<RoomTransfer[]>([]);

  const canSubmit = canSubmitTransfer(selectedRoomId, reason);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      catRepository
        .getCat(catId)
        .then((result) => {
          if (cancelled || !result) {
            return;
          }
          setCat(result);

          return listActiveRooms().then((activeRooms) => {
            const current = activeRooms.find((room) => room.id === result.roomId) ?? null;
            const others = activeRooms.filter((room) => room.id !== result.roomId);

            return Promise.all([
              current
                ? countCatsInRoom(current.id)
                    .catch(() => 0)
                    .then((occupied) => ({
                      title: current.title,
                      description: current.description,
                      occupied,
                      capacity: current.maxCapacity,
                    }))
                : null,
              Promise.all(
                others.map((room) =>
                  countCatsInRoom(room.id)
                    .catch(() => 0)
                    .then((occupied) => ({ id: room.id, title: room.title, occupied, capacity: room.maxCapacity })),
                ),
              ),
            ]);
          });
        })
        .then((result) => {
          if (!cancelled && result) {
            const [current, others] = result;
            setCurrentRoomInfo(current);
            setRooms(others);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLoadError('Não foi possível carregar as salas.');
          }
        });

      listRoomTransfers(catId)
        .then((transfers) => {
          if (!cancelled) {
            setHistory(transfers);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setHistory([]);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [catId]),
  );

  async function confirmTransfer() {
    const trimmedReason = reason.trim();
    if (!cat || selectedRoomId === null || !trimmedReason) {
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const updated = await createRoomTransfer(cat.id, { roomId: selectedRoomId, reason: trimmedReason });
      await catRepository.cacheCat(updated);
      onTransferred();
    } catch (error) {
      setSubmitError(transferErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transferir de sala</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.currentRoomCard}>
          <Text style={styles.cardLabel}>Sala atual</Text>
          <Text style={styles.currentRoomTitle}>{cat?.roomTitle ?? 'Sem sala'}</Text>
          {currentRoomInfo && (
            <Text style={styles.currentRoomSubtitle}>{currentRoomSubtitle(currentRoomInfo)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Selecionar nova sala</Text>

          {loadError ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>{loadError}</Text>
            </View>
          ) : rooms === null ? (
            <View style={styles.feedback}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>Nenhuma outra sala ativa disponível.</Text>
            </View>
          ) : (
            rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.roomRow, isSelected ? styles.roomRowSelected : null]}
                  onPress={() => setSelectedRoomId(room.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomTitle}>{room.title}</Text>
                    <Text style={styles.roomSubtitle}>{occupancySubtitle(room)}</Text>
                  </View>
                  <View style={[styles.radioOuter, isSelected ? styles.radioOuterSelected : null]} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Motivo da transferência</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Ex.: Alta clínica, apta para socialização."
            placeholderTextColor={colors.inkFaint}
            multiline
            numberOfLines={3}
          />
        </View>

        {submitError && (
          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{submitError}</Text>
          </View>
        )}

        <Button
          title="Confirmar transferência"
          onPress={confirmTransfer}
          loading={submitting}
          disabled={!canSubmit}
        />

        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Histórico de transferências</Text>
            <View style={styles.timelineCard}>
              {history.map((transfer, index) => {
                const isFirst = index === 0;
                const isLast = index === history.length - 1;
                return (
                  <View key={transfer.id} style={styles.timelineItem}>
                    <View style={styles.timelineTrack}>
                      <View style={[styles.timelineDot, isFirst ? styles.timelineDotCurrent : null]} />
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>
                    <View style={[styles.timelineContent, isLast ? styles.timelineContentLast : null]}>
                      <Text style={styles.timelineRooms}>
                        {transferFromLabel(transfer)} → {transfer.toRoomTitle}
                      </Text>
                      <Text style={styles.timelineDate}>{transferDateTimeLabel(transfer)}</Text>
                      <Text style={styles.timelineReason}>{transfer.reason}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
