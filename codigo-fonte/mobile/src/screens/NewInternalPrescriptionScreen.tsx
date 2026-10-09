import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  FormRow,
  FormScreenLayout,
  MedicationAutocomplete,
  SelectField,
  TextField,
} from '../components';
import { ApiError } from '../services/api';
import { getCat } from '../services/catService';
import { createInternalMedicalPrescription } from '../services/medicalPrescriptionService';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import type {
  AdministrationRoute,
  CreateInternalMedicalPrescriptionRequest,
} from '../types/medicalPrescription';
import { ADMINISTRATION_ROUTE_LABELS } from '../types/medicalPrescription';
import type { StockItem } from '../types/stock';
import { roomLabel } from '../utils/medicalRecord';
import { styles } from './NewInternalPrescriptionScreen.styles';

const ROUTE_OPTIONS = Object.entries(ADMINISTRATION_ROUTE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const MAX_INTERVAL_HOURS = 720;
const MAX_DURATION_DAYS = 365;

interface PrescriptionFormValues {
  title: string;
  prescribeMedication: boolean;
  medicationName: string;
  dosage: string;
  route: string | null;
  intervalHours: string;
  durationDays: string;
  notes: string;
}

const DEFAULT_VALUES: PrescriptionFormValues = {
  title: '',
  prescribeMedication: true,
  medicationName: '',
  dosage: '',
  route: null,
  intervalHours: '',
  durationDays: '',
  notes: '',
};

function requiredWhenPrescribing(message: string) {
  return (value: string | null, values: PrescriptionFormValues) =>
    !values.prescribeMedication || (value ?? '').trim() !== '' || message;
}

function integerWhenPrescribing(max: number, message: string) {
  return (value: string, values: PrescriptionFormValues) => {
    if (!values.prescribeMedication) {
      return true;
    }
    const number = Number(value);
    return (Number.isInteger(number) && number >= 1 && number <= max) || message;
  };
}

function saveErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível salvar o atendimento. Tente novamente.';
  }
  switch (error.status) {
    case 409:
      return error.message;
    case 403:
      return 'Apenas veterinários com CRMV cadastrado podem registrar atendimentos internos.';
    case 404:
      return 'O gatinho ou o medicamento não foi encontrado.';
    case 400:
      return 'Confira os dados informados e tente novamente.';
    default:
      return error.message;
  }
}

interface NewInternalPrescriptionScreenProps {
  catId: number;
  onBack: () => void;
  onSaved: () => void;
}

export function NewInternalPrescriptionScreen({ catId, onBack, onSaved }: NewInternalPrescriptionScreenProps) {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [selectedMedication, setSelectedMedication] = useState<StockItem | null>(null);
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({ defaultValues: DEFAULT_VALUES });

  const prescribeMedication = watch('prescribeMedication');

  useEffect(() => {
    getCat(catId)
      .then(setCat)
      .catch((error) => {
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? 'Gato não encontrado.'
            : 'Não foi possível carregar o gato.',
        );
      })
      .finally(() => setLoadingCat(false));
  }, [catId]);

  async function submit(values: PrescriptionFormValues) {
    setGeneralError(undefined);
    setSubmitting(true);

    const request: CreateInternalMedicalPrescriptionRequest = {
      title: values.title.trim(),
      notes: values.notes.trim() || null,
      medication: values.prescribeMedication
        ? {
          medicationId: selectedMedication?.id ?? null,
          newMedicationName: selectedMedication ? null : values.medicationName.trim(),
          newMedicationUnit: null,
          dosage: values.dosage.trim(),
          route: values.route as AdministrationRoute,
          intervalHours: Number(values.intervalHours),
          durationDays: Number(values.durationDays),
        }
        : null,
    };

    try {
      const saved = await createInternalMedicalPrescription(catId, request);
      const stockWarning = saved.medication?.stockWarning;

      if (stockWarning) {
        Alert.alert('Atendimento registrado', stockWarning, [{ text: 'OK', onPress: onSaved }]);
      } else {
        onSaved();
      }
    } catch (error) {
      setGeneralError(saveErrorMessage(error));
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
        <Text style={styles.headerTitle}>Nova prescrição</Text>
      </View>

      {loadingCat ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadError || !cat ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.generalError}>{loadError}</Text>
        </View>
      ) : (
        <FormScreenLayout>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyLabel}>Gato</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyValue}>
                {cat.name} — {roomLabel(cat)}
              </Text>
            </View>
          </View>

          <Controller
            control={control}
            name="title"
            rules={{ validate: (value) => value.trim() !== '' || 'Informe o diagnóstico ou título.' }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Diagnóstico / título"
                placeholder="Ex: Reavaliação de FIV+"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="prescribeMedication"
            render={({ field: { value, onChange } }) => (
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleTitle}>Prescrever medicação nesta consulta</Text>
                  <Text style={styles.toggleHint}>
                    Desative para registrar apenas uma consulta, sem alterar a medicação em uso.
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                  ios_backgroundColor={colors.border}
                  accessibilityLabel="Prescrever medicação nesta consulta"
                />
              </View>
            )}
          />

          {prescribeMedication && (
            <>
              <Controller
                control={control}
                name="medicationName"
                rules={{ validate: requiredWhenPrescribing('Informe o medicamento.') }}
                render={({ field: { value, onChange } }) => (
                  <MedicationAutocomplete
                    value={value}
                    selected={selectedMedication}
                    onChangeText={(text) => {
                      onChange(text);
                      if (selectedMedication && text !== selectedMedication.name) {
                        setSelectedMedication(null);
                      }
                    }}
                    onSelect={(item) => {
                      setSelectedMedication(item);
                      onChange(item.name);
                    }}
                    error={errors.medicationName?.message}
                  />
                )}
              />

              <FormRow>
                <Controller
                  control={control}
                  name="dosage"
                  rules={{ validate: requiredWhenPrescribing('Informe a dosagem.') }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="Dosagem"
                      placeholder="Ex: 0,5 ml"
                      value={value}
                      onChangeText={onChange}
                      error={errors.dosage?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="route"
                  rules={{ validate: requiredWhenPrescribing('Selecione a via.') }}
                  render={({ field: { value, onChange } }) => (
                    <SelectField
                      label="Via"
                      value={value}
                      placeholder="Selecione"
                      options={ROUTE_OPTIONS}
                      onChange={onChange}
                      error={errors.route?.message}
                    />
                  )}
                />
              </FormRow>

              <FormRow>
                <Controller
                  control={control}
                  name="intervalHours"
                  rules={{
                    validate: integerWhenPrescribing(MAX_INTERVAL_HOURS, `De 1 a ${MAX_INTERVAL_HOURS} horas.`),
                  }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="A cada (horas)"
                      placeholder="Ex: 48"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      error={errors.intervalHours?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="durationDays"
                  rules={{
                    validate: integerWhenPrescribing(MAX_DURATION_DAYS, `De 1 a ${MAX_DURATION_DAYS} dias.`),
                  }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="Duração (dias)"
                      placeholder="Ex: 90"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                      error={errors.durationDays?.message}
                    />
                  )}
                />
              </FormRow>
            </>
          )}

          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Observações"
                placeholder="Ex: Reavaliar em 30 dias."
                multiline
                numberOfLines={3}
                style={styles.notesInput}
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

          <Button
            title={prescribeMedication ? 'Salvar prescrição' : 'Salvar consulta'}
            onPress={handleSubmit(submit)}
            loading={submitting}
          />
        </FormScreenLayout>
      )}
    </View>
  );
}
