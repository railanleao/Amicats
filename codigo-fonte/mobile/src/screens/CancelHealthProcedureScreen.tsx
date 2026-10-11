import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormScreenLayout, ReadOnlyField, TextField } from '../components';
import { Text } from '../components/Text';
import { cancelHealthProcedure, getHealthProcedure } from '../services/healthProcedureService';
import { colors } from '../theme/colors';
import type { HealthProcedure } from '../types/healthProcedure';
import { healthProcedureErrorMessage, healthProcedureName } from '../utils/healthProcedure';
import { styles } from './CancelHealthProcedureScreen.styles';

const REASON_MAX_LENGTH = 500;

interface CancelFormValues {
  reason: string;
}

interface CancelHealthProcedureScreenProps {
  procedureId: number;
  onBack: () => void;
  onDone: () => void;
}

export function CancelHealthProcedureScreen({ procedureId, onBack, onDone }: CancelHealthProcedureScreenProps) {
  const [procedure, setProcedure] = useState<HealthProcedure | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelFormValues>({ defaultValues: { reason: '' } });

  useEffect(() => {
    getHealthProcedure(procedureId)
      .then(setProcedure)
      .catch((error) => setLoadError(healthProcedureErrorMessage(error, 'Não foi possível carregar o agendamento.')));
  }, [procedureId]);

  async function submit(values: CancelFormValues) {
    setGeneralError(undefined);
    setSubmitting(true);

    try {
      await cancelHealthProcedure(procedureId, { reason: values.reason.trim() });
      onDone();
    } catch (error) {
      setGeneralError(healthProcedureErrorMessage(error, 'Não foi possível cancelar. Verifique a conexão.'));
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
        <Text style={styles.headerTitle}>Cancelar agendamento</Text>
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
            name="reason"
            rules={{ validate: (value) => value.trim() !== '' || 'Informe o motivo do cancelamento.' }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Motivo do cancelamento"
                placeholder="Ex: Falta da vacina no estoque."
                multiline
                numberOfLines={3}
                maxLength={REASON_MAX_LENGTH}
                style={styles.reasonInput}
                value={value}
                onChangeText={onChange}
                error={errors.reason?.message}
              />
            )}
          />

          <Text style={styles.hint}>O cancelamento não pode ser desfeito e fica registrado no histórico.</Text>

          {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

          <Button variant="danger" title="Confirmar cancelamento" onPress={handleSubmit(submit)} loading={submitting} />
        </FormScreenLayout>
      )}
    </View>
  );
}
