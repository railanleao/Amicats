import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, StatusBadge } from '../components';
import { Text } from '../components/Text';
import { getHealthProcedure, listHealthProcedureChanges } from '../services/healthProcedureService';
import { colors } from '../theme/colors';
import type { HealthProcedure, HealthProcedureChange } from '../types/healthProcedure';
import { HEALTH_PROCEDURE_ACTION_LABELS, HEALTH_PROCEDURE_TYPE_LABELS } from '../types/healthProcedure';
import { formatBrazilianDate } from '../utils/date';
import {
  changeDescription,
  formatChangedAt,
  healthProcedureErrorMessage,
  healthProcedureName,
  healthProcedureStatusLabel,
  healthProcedureTone,
} from '../utils/healthProcedure';
import { styles } from './HealthProcedureScreen.styles';

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChangeItem({ change }: { change: HealthProcedureChange }) {
  const description = changeDescription(change);

  return (
    <View style={styles.changeItem}>
      <Text style={styles.changeAction}>{HEALTH_PROCEDURE_ACTION_LABELS[change.action]}</Text>
      {description && <Text style={styles.changeDetail}>{description}</Text>}
      <Text style={styles.changeMeta}>
        {change.userName} · {formatChangedAt(change.changedAt)}
      </Text>
    </View>
  );
}

interface HealthProcedureScreenProps {
  procedureId: number;
  canManage: boolean;
  onBack: () => void;
  onOpenProcedure: (procedureId: number) => void;
  onEdit: (procedureId: number) => void;
  onComplete: (procedureId: number) => void;
  onCancel: (procedureId: number) => void;
}

export function HealthProcedureScreen({
  procedureId,
  canManage,
  onBack,
  onOpenProcedure,
  onEdit,
  onComplete,
  onCancel,
}: HealthProcedureScreenProps) {
  const [procedure, setProcedure] = useState<HealthProcedure | null>(null);
  const [changes, setChanges] = useState<HealthProcedureChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [changesError, setChangesError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setErrorMessage(null);

    getHealthProcedure(procedureId)
      .then((result) => {
        if (!cancelled) {
          setProcedure(result);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(healthProcedureErrorMessage(error, 'Não foi possível carregar o agendamento. Verifique a conexão.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    listHealthProcedureChanges(procedureId)
      .then((result) => {
        if (!cancelled) {
          setChanges(result);
          setChangesError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChangesError('Não foi possível carregar o histórico.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [procedureId]);

  useFocusEffect(load);

  function retry() {
    setLoading(true);
    load();
  }

  const canChange = canManage && procedure?.status === 'Scheduled';
  const previousProcedureId = procedure?.previousHealthProcedureId ?? null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {procedure ? `${healthProcedureName(procedure)} — ${procedure.catName}` : 'Agendamento'}
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{errorMessage}</Text>
          <Button variant="outline" title="Tentar novamente" onPress={retry} />
        </View>
      ) : loading || !procedure ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{HEALTH_PROCEDURE_TYPE_LABELS[procedure.type]}</Text>
              <StatusBadge label={healthProcedureStatusLabel(procedure)} tone={healthProcedureTone(procedure)} />
            </View>

            <InfoRow label="Gato">
              <Text style={styles.infoValue}>{procedure.catName}</Text>
            </InfoRow>
            {procedure.name && (
              <InfoRow label="Procedimento">
                <Text style={styles.infoValue}>{procedure.name}</Text>
              </InfoRow>
            )}
            <InfoRow label="Data agendada">
              <Text style={styles.infoValue}>{formatBrazilianDate(procedure.scheduledDate)}</Text>
            </InfoRow>
            {procedure.completedDate && (
              <InfoRow label="Realizado em">
                <Text style={styles.infoValue}>{formatBrazilianDate(procedure.completedDate)}</Text>
              </InfoRow>
            )}
            <InfoRow label="Registrado por">
              <Text style={styles.infoValue}>{procedure.createdByName}</Text>
            </InfoRow>
            {previousProcedureId !== null && (
              <InfoRow label="Reforço de">
                <TouchableOpacity onPress={() => onOpenProcedure(previousProcedureId)} accessibilityRole="link">
                  <Text style={styles.link}>Ver vacina anterior</Text>
                </TouchableOpacity>
              </InfoRow>
            )}
            {procedure.notes && (
              <View style={styles.block}>
                <Text style={styles.infoLabel}>Observações</Text>
                <Text style={styles.blockText}>{procedure.notes}</Text>
              </View>
            )}
            {procedure.cancelReason && (
              <View style={styles.block}>
                <Text style={styles.infoLabel}>Motivo do cancelamento</Text>
                <Text style={styles.blockText}>{procedure.cancelReason}</Text>
              </View>
            )}
          </View>

          {canChange && (
            <View style={styles.actions}>
              <Button title="Marcar como realizado" onPress={() => onComplete(procedure.id)} />
              <Button variant="outline" title="Editar" onPress={() => onEdit(procedure.id)} />
              <Button variant="outline" title="Cancelar agendamento" onPress={() => onCancel(procedure.id)} />
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Histórico de alterações</Text>
            {changesError ? (
              <Text style={styles.emptyText}>{changesError}</Text>
            ) : changes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma alteração registrada.</Text>
            ) : (
              changes.map((change) => <ChangeItem key={change.id} change={change} />)
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
