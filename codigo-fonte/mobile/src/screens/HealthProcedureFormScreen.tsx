import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, CatAutocomplete, FormScreenLayout, ReadOnlyField, TextField } from '../components';
import { Text } from '../components/Text';
import {
  createHealthProcedure,
  getHealthProcedure,
  updateHealthProcedure,
} from '../services/healthProcedureService';
import { catRepository } from '../sync/runtime';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import type { HealthProcedure, HealthProcedureType } from '../types/healthProcedure';
import { HEALTH_PROCEDURE_TYPE_LABELS } from '../types/healthProcedure';
import { formatBrazilianDate, maskBrazilianDate } from '../utils/date';
import {
  healthProcedureErrorMessage,
  parseDateInput,
  todayIsoDate,
  validateProcedureName,
  validateScheduledDate,
} from '../utils/healthProcedure';
import { styles } from './HealthProcedureFormScreen.styles';

const NAME_MAX_LENGTH = 150;
const NOTES_MAX_LENGTH = 1000;

const TYPE_OPTIONS = Object.entries(HEALTH_PROCEDURE_TYPE_LABELS) as [HealthProcedureType, string][];

interface FixedCat {
  id: number;
  name: string;
}

interface HealthProcedureFormValues {
  catName: string;
  type: HealthProcedureType | null;
  name: string;
  scheduledDate: string;
  notes: string;
}

const DEFAULT_VALUES: HealthProcedureFormValues = {
  catName: '',
  type: null,
  name: '',
  scheduledDate: '',
  notes: '',
};

interface HealthProcedureFormScreenProps {
  procedureId?: number;
  catId?: number;
  onBack: () => void;
  onSaved: (procedure: HealthProcedure) => void;
}

export function HealthProcedureFormScreen({ procedureId, catId, onBack, onSaved }: HealthProcedureFormScreenProps) {
  const isEdit = procedureId !== undefined;
  const [fixedCat, setFixedCat] = useState<FixedCat | null>(null);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [originalScheduledDate, setOriginalScheduledDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit || catId !== undefined);
  const [loadError, setLoadError] = useState<string>();
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HealthProcedureFormValues>({ defaultValues: DEFAULT_VALUES });

  const type = useWatch({ control, name: 'type' });
  const requiresName = type !== 'Neutering';

  useEffect(() => {
    if (procedureId !== undefined) {
      getHealthProcedure(procedureId)
        .then((procedure) => {
          if (procedure.status !== 'Scheduled') {
            setLoadError('Só é possível editar agendamentos que ainda não foram realizados nem cancelados.');
            return;
          }
          setFixedCat({ id: procedure.catId, name: procedure.catName });
          setOriginalScheduledDate(procedure.scheduledDate);
          reset({
            catName: procedure.catName,
            type: procedure.type,
            name: procedure.name ?? '',
            scheduledDate: formatBrazilianDate(procedure.scheduledDate),
            notes: procedure.notes ?? '',
          });
        })
        .catch((error) => setLoadError(healthProcedureErrorMessage(error, 'Não foi possível carregar o agendamento.')))
        .finally(() => setLoading(false));
      return;
    }

    if (catId !== undefined) {
      catRepository
        .getCat(catId)
        .then((cat) => {
          if (cat) {
            setFixedCat({ id: cat.id, name: cat.name });
          } else {
            setLoadError('Gato não encontrado.');
          }
        })
        .catch(() => setLoadError('Não foi possível carregar o gato.'))
        .finally(() => setLoading(false));
    }
  }, [procedureId, catId, reset]);

  async function submit(values: HealthProcedureFormValues) {
    const cat = fixedCat ?? selectedCat;
    const scheduledDate = parseDateInput(values.scheduledDate);
    if (!cat || !values.type || !scheduledDate) {
      return;
    }
    if (cat.id < 0) {
      setGeneralError('Este gatinho ainda não foi enviado ao servidor. Aguarde a sincronização.');
      return;
    }

    setGeneralError(undefined);
    setSubmitting(true);

    const name = requiresName ? values.name.trim() : null;
    const notes = values.notes.trim() || null;

    try {
      const saved =
        procedureId !== undefined
          ? await updateHealthProcedure(procedureId, { name, scheduledDate, notes })
          : await createHealthProcedure({ catId: cat.id, type: values.type, name, scheduledDate, notes });
      onSaved(saved);
    } catch (error) {
      setGeneralError(healthProcedureErrorMessage(error, 'Não foi possível salvar o agendamento. Verifique a conexão.'));
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
        <Text style={styles.headerTitle}>{isEdit ? 'Editar agendamento' : 'Novo agendamento'}</Text>
      </View>

      {loading ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.feedback}>
          <Text style={styles.generalError}>{loadError}</Text>
        </View>
      ) : (
        <FormScreenLayout>
          {fixedCat ? (
            <ReadOnlyField label="Gato" value={fixedCat.name} />
          ) : (
            <Controller
              control={control}
              name="catName"
              rules={{ validate: () => selectedCat !== null || 'Escolha o gatinho na lista.' }}
              render={({ field: { value, onChange } }) => (
                <CatAutocomplete
                  value={value}
                  selected={selectedCat}
                  onChangeText={(text) => {
                    onChange(text);
                    if (selectedCat && text !== selectedCat.name) {
                      setSelectedCat(null);
                    }
                  }}
                  onSelect={(cat) => {
                    setSelectedCat(cat);
                    onChange(cat.name);
                  }}
                  error={errors.catName?.message}
                />
              )}
            />
          )}

          {isEdit && type ? (
            <ReadOnlyField label="Tipo" value={HEALTH_PROCEDURE_TYPE_LABELS[type]} />
          ) : (
            <Controller
              control={control}
              name="type"
              rules={{ validate: (value) => value !== null || 'Escolha o tipo.' }}
              render={({ field: { value, onChange } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.options}>
                    {TYPE_OPTIONS.map(([optionValue, label]) => {
                      const isActive = optionValue === value;
                      return (
                        <TouchableOpacity
                          key={optionValue}
                          style={[styles.option, isActive ? styles.optionActive : null]}
                          onPress={() => onChange(optionValue)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isActive }}
                        >
                          <Text style={[styles.optionText, isActive ? styles.optionTextActive : null]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.type?.message ? <Text style={styles.errorText}>{errors.type.message}</Text> : null}
                </View>
              )}
            />
          )}

          {requiresName && (
            <Controller
              control={control}
              name="name"
              rules={{ validate: validateProcedureName }}
              render={({ field: { value, onChange } }) => (
                <TextField
                  label={type === 'Deworming' ? 'Vermífugo' : 'Vacina'}
                  placeholder={type === 'Deworming' ? 'Ex: Drontal' : 'Ex: Antirrábica'}
                  maxLength={NAME_MAX_LENGTH}
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="scheduledDate"
            rules={{ validate: (value) => validateScheduledDate(value, todayIsoDate(), originalScheduledDate) }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Data agendada"
                placeholder="dd/mm/aaaa"
                keyboardType="number-pad"
                value={value}
                onChangeText={(text) => onChange(maskBrazilianDate(text))}
                error={errors.scheduledDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Observações"
                placeholder="Ex: Levar carteira de vacinação."
                multiline
                numberOfLines={3}
                maxLength={NOTES_MAX_LENGTH}
                style={styles.notesInput}
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

          <Button title={isEdit ? 'Salvar alterações' : 'Agendar'} onPress={handleSubmit(submit)} loading={submitting} />
        </FormScreenLayout>
      )}
    </View>
  );
}
