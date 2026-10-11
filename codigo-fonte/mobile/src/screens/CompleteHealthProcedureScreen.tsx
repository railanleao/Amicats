import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Switch, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormScreenLayout, ReadOnlyField, TextField } from '../components';
import { Text } from '../components/Text';
import { completeHealthProcedure, getHealthProcedure } from '../services/healthProcedureService';
import { colors } from '../theme/colors';
import type { HealthProcedure } from '../types/healthProcedure';
import { formatBrazilianDate, maskBrazilianDate } from '../utils/date';
import type { BoosterOption } from '../utils/healthProcedure';
import {
  BOOSTER_OPTIONS,
  boosterDate,
  healthProcedureErrorMessage,
  healthProcedureName,
  parseDateInput,
  todayIsoDate,
} from '../utils/healthProcedure';
import { styles } from './CompleteHealthProcedureScreen.styles';

const NOTES_MAX_LENGTH = 1000;

interface CompleteFormValues {
  completedDate: string;
  notes: string;
  scheduleBooster: boolean;
  boosterOption: BoosterOption;
  boosterDate: string;
}

function resolveBoosterDate(values: CompleteFormValues): string | null {
  return boosterDate(parseDateInput(values.completedDate), values.boosterOption, parseDateInput(values.boosterDate));
}

interface CompleteHealthProcedureScreenProps {
  procedureId: number;
  onBack: () => void;
  onDone: () => void;
}

export function CompleteHealthProcedureScreen({ procedureId, onBack, onDone }: CompleteHealthProcedureScreenProps) {
  const [procedure, setProcedure] = useState<HealthProcedure | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteFormValues>({
    defaultValues: {
      completedDate: formatBrazilianDate(todayIsoDate()),
      notes: '',
      scheduleBooster: false,
      boosterOption: 'oneYear',
      boosterDate: '',
    },
  });

  const values = watch();
  const isVaccine = procedure?.type === 'Vaccine';
  const previewDate = isVaccine && values.scheduleBooster ? resolveBoosterDate(values) : null;
  const previewInPast = values.boosterOption !== 'custom' && previewDate !== null && previewDate < todayIsoDate();

  useEffect(() => {
    getHealthProcedure(procedureId)
      .then((result) => {
        setProcedure(result);
        setValue('notes', result.notes ?? '');
      })
      .catch((error) => setLoadError(healthProcedureErrorMessage(error, 'Não foi possível carregar o agendamento.')));
  }, [procedureId, setValue]);

  function validateCompletedDate(value: string): true | string {
    const isoDate = parseDateInput(value);
    if (!isoDate) {
      return 'Informe uma data válida (dd/mm/aaaa).';
    }
    return isoDate <= todayIsoDate() || 'A data de realização não pode estar no futuro.';
  }

  function validateCustomBoosterDate(value: string, formValues: CompleteFormValues): true | string {
    if (!isVaccine || !formValues.scheduleBooster || formValues.boosterOption !== 'custom') {
      return true;
    }
    const isoDate = parseDateInput(value);
    if (!isoDate) {
      return 'Informe a data do reforço (dd/mm/aaaa).';
    }
    return isoDate >= todayIsoDate() || 'A data do reforço não pode estar no passado.';
  }

  async function submit(formValues: CompleteFormValues) {
    const completedDate = parseDateInput(formValues.completedDate);
    if (!completedDate || previewInPast) {
      return;
    }

    setGeneralError(undefined);
    setSubmitting(true);

    try {
      await completeHealthProcedure(procedureId, {
        completedDate,
        notes: formValues.notes.trim() || null,
        boosterDate: isVaccine && formValues.scheduleBooster ? resolveBoosterDate(formValues) : null,
      });
      onDone();
    } catch (error) {
      setGeneralError(healthProcedureErrorMessage(error, 'Não foi possível salvar. Verifique a conexão.'));
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
        <Text style={styles.headerTitle}>Marcar como realizado</Text>
      </View>

      {loadError ? (
        <View style={styles.feedback}>
          <Text style={styles.generalError}>{loadError}</Text>
        </View>
      ) : !procedure ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FormScreenLayout>
          <ReadOnlyField label="Agendamento" value={`${healthProcedureName(procedure)} — ${procedure.catName}`} />

          <Controller
            control={control}
            name="completedDate"
            rules={{ validate: validateCompletedDate }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Data de realização"
                placeholder="dd/mm/aaaa"
                keyboardType="number-pad"
                value={value}
                onChangeText={(text) => onChange(maskBrazilianDate(text))}
                error={errors.completedDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Observações"
                multiline
                numberOfLines={3}
                maxLength={NOTES_MAX_LENGTH}
                style={styles.notesInput}
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {isVaccine && (
            <Controller
              control={control}
              name="scheduleBooster"
              render={({ field: { value, onChange } }) => (
                <View style={styles.toggleRow}>
                  <View style={styles.toggleText}>
                    <Text style={styles.toggleTitle}>Agendar reforço desta vacina</Text>
                    <Text style={styles.toggleHint}>O reforço entra como um novo agendamento ligado a este.</Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                    ios_backgroundColor={colors.border}
                    accessibilityLabel="Agendar reforço desta vacina"
                  />
                </View>
              )}
            />
          )}

          {isVaccine && values.scheduleBooster && (
            <>
              <Controller
                control={control}
                name="boosterOption"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.options}>
                    {BOOSTER_OPTIONS.map((option) => {
                      const isActive = option.value === value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[styles.option, isActive ? styles.optionActive : null]}
                          onPress={() => onChange(option.value)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isActive }}
                        >
                          <Text style={[styles.optionText, isActive ? styles.optionTextActive : null]}>{option.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />

              {values.boosterOption === 'custom' && (
                <Controller
                  control={control}
                  name="boosterDate"
                  rules={{ validate: validateCustomBoosterDate }}
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      label="Data do reforço"
                      placeholder="dd/mm/aaaa"
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={(text) => onChange(maskBrazilianDate(text))}
                      error={errors.boosterDate?.message}
                    />
                  )}
                />
              )}

              {previewInPast ? (
                <Text style={styles.warningText}>
                  Essa data ({formatBrazilianDate(previewDate)}) já passou. Escolha "Outra data" para agendar o reforço.
                </Text>
              ) : previewDate && previewDate >= todayIsoDate() ? (
                <Text style={styles.hintText}>O reforço será agendado para {formatBrazilianDate(previewDate)}.</Text>
              ) : null}
            </>
          )}

          {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

          <Button title="Confirmar realização" onPress={handleSubmit(submit)} loading={submitting} />
        </FormScreenLayout>
      )}
    </View>
  );
}
