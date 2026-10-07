import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Button, LinkButton, SectionLabel, StatusBadge } from '../components';
import { useSync } from '../sync/SyncContext';
import { colors } from '../theme/colors';
import { formatClockTime, formatRelativeTime } from '../utils/relativeTime';
import { styles } from './SyncScreen.styles';

interface SyncScreenProps {
  onBack: () => void;
}

function statusTitle(online: boolean, syncing: boolean, pending: number, rejected: number): string {
  if (syncing) {
    return 'Sincronizando…';
  }
  if (!online) {
    return 'Sem conexão';
  }
  if (rejected > 0) {
    return 'Há registros recusados';
  }
  if (pending > 0) {
    return 'Aguardando envio';
  }
  return 'Sincronizado';
}

export function SyncScreen({ onBack }: SyncScreenProps) {
  const { online, syncing, pending, rejected, lastSyncAt, diagnostic, items, syncNow, discard, retry } = useSync();

  const needsAttention = !online || rejected > 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sincronização</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, needsAttention ? styles.statusIconWarning : null]}>
            <Ionicons
              name={online ? 'sync-outline' : 'cloud-offline-outline'}
              size={24}
              color={needsAttention ? colors.warning : colors.primary}
            />
          </View>
          <Text style={styles.statusTitle}>{statusTitle(online, syncing, pending, rejected)}</Text>
          <Text style={styles.statusSubtitle}>Última sincronização: {formatRelativeTime(lastSyncAt, new Date())}</Text>
          {diagnostic ? <Text style={styles.statusDiagnostic}>{diagnostic}</Text> : null}
        </View>

        <SectionLabel>{`FILA DE PENDÊNCIAS (${items.length})`}</SectionLabel>

        <View style={styles.list}>
          {items.length === 0 ? (
            <Text style={styles.empty}>Nenhum registro aguardando envio.</Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>{item.label}</Text>
                  {item.status === 'rejected' ? <StatusBadge label="Recusado" tone="danger" /> : null}
                </View>
                <Text style={styles.itemSubtitle}>Registrado offline às {formatClockTime(item.recordedAt)}</Text>
                {item.error ? <Text style={styles.itemError}>{item.error}</Text> : null}
                {item.status === 'rejected' ? (
                  <View style={styles.itemActions}>
                    <LinkButton title="Tentar de novo" onPress={() => void retry(item.id)} />
                    <LinkButton title="Descartar" tone="muted" onPress={() => void discard(item.id)} />
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>

        <Button title="Sincronizar agora" onPress={() => void syncNow()} loading={syncing} />
      </ScrollView>
    </View>
  );
}
