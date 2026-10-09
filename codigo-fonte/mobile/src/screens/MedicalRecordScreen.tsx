import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, CatAvatar, StatusBadge } from '../components';
import { Text } from '../components/Text';
import { listActivePrescribedMedications } from '../services/medicalPrescriptionService';
import { catRepository } from '../sync/runtime';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import type { PrescribedMedication } from '../types/medicalPrescription';
import { formatBrazilianDate } from '../utils/date';
import { felvBadge, fivBadge, medicalRecordSubtitle, medicationSchedule, neuteredLabel, weightLabel } from '../utils/medicalRecord';
import { styles } from './MedicalRecordScreen.styles';

interface MedicalRecordScreenProps {
  catId: number;
  canPrescribe: boolean;
  onBack: () => void;
  onNewPrescription: (catId: number) => void;
}

function SummaryRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.summaryRow, last ? styles.summaryRowLast : null]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      {children}
    </View>
  );
}

function MedicationItem({ medication }: { medication: PrescribedMedication }) {
  const origin = medication.origin === 'ExternalClinic' ? ' · Clínica externa' : '';

  return (
    <View style={styles.medicationItem}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationName}>{medication.medicationName}</Text>
        {medication.medicationStockStatus === 'OutOfStock' && <StatusBadge label="Sem estoque" tone="danger" />}
      </View>
      <Text style={styles.medicationDetail}>{medicationSchedule(medication)}</Text>
      <Text style={styles.medicationDetail}>
        Até {formatBrazilianDate(medication.endDate)}
        {origin}
      </Text>
    </View>
  );
}

export function MedicalRecordScreen({ catId, canPrescribe, onBack, onNewPrescription }: MedicalRecordScreenProps) {
  const [cat, setCat] = useState<Cat | null>(null);
  const [medications, setMedications] = useState<PrescribedMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [medicationsError, setMedicationsError] = useState<string | null>(null);

  const loadRecord = useCallback(() => {
    let cancelled = false;

    catRepository
      .getCat(catId)
      .then((result) => {
        if (!cancelled) {
          setCat(result);
          setErrorMessage(result ? null : 'Gato não encontrado.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('Não foi possível carregar o prontuário.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    listActivePrescribedMedications(catId)
      .then((result) => {
        if (!cancelled) {
          setMedications(result);
          setMedicationsError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMedicationsError('Não foi possível carregar a medicação ativa. Verifique a conexão.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [catId]);

  useFocusEffect(loadRecord);

  function retry() {
    setErrorMessage(null);
    setLoading(true);
    loadRecord();
  }

  const fiv = cat ? fivBadge(cat.healthStatus) : null;
  const felv = cat ? felvBadge(cat.healthStatus) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {cat ? `Prontuário — ${cat.name}` : 'Prontuário'}
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{errorMessage}</Text>
          <Button variant="outline" title="Tentar novamente" onPress={retry} />
        </View>
      ) : loading || !cat ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.identity}>
              <CatAvatar cat={cat} size={56} />
              <View style={styles.identityText}>
                <Text style={styles.name}>{cat.name}</Text>
                <Text style={styles.subtitle}>{medicalRecordSubtitle(cat)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumo clínico</Text>
              <SummaryRow label="FIV">{fiv && <StatusBadge label={fiv.label} tone={fiv.tone} />}</SummaryRow>
              <SummaryRow label="FeLV">{felv && <StatusBadge label={felv.label} tone={felv.tone} />}</SummaryRow>
              <SummaryRow label={cat.sex === 'Male' ? 'Castrado' : 'Castrada'}>
                <Text style={styles.summaryValue}>{neuteredLabel(cat)}</Text>
              </SummaryRow>
              <SummaryRow label="Peso atual" last>
                <Text style={styles.summaryValue}>{weightLabel(cat)}</Text>
              </SummaryRow>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Medicação ativa</Text>
              {medicationsError ? (
                <Text style={styles.emptyText}>{medicationsError}</Text>
              ) : medications.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma medicação ativa.</Text>
              ) : (
                medications.map((medication) => <MedicationItem key={medication.id} medication={medication} />)
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Linha do tempo</Text>
              <Text style={styles.emptyText}>Nenhum evento registrado ainda.</Text>
            </View>
          </ScrollView>

          {canPrescribe && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => onNewPrescription(catId)}
              accessibilityRole="button"
              accessibilityLabel="Nova prescrição"
            >
              <Ionicons name="add" size={28} color={colors.onPrimary} />
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
