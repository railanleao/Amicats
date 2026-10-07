import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Text } from '../components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextField } from '../components';
import { ApiError } from '../services/api';
import { colors } from '../theme/colors';
import type { ChangePasswordRequest } from '../types/auth';
import { styles } from './NewPasswordScreen.styles';

interface NewPasswordScreenProps {
  onSubmit: (values: ChangePasswordRequest) => Promise<void>;
}

export function NewPasswordScreen({ onSubmit }: NewPasswordScreenProps) {
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ChangePasswordRequest>({
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  async function submit(values: ChangePasswordRequest) {
    setGeneralError(undefined);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setGeneralError(error instanceof ApiError ? error.message : 'Não foi possível salvar a nova senha.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name="lock-closed-outline" size={22} color={colors.background} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Defina sua nova senha</Text>
          <Text style={styles.subtitle}>Por segurança, você precisa criar uma nova senha antes de continuar.</Text>
        </View>
      </View>

      <View style={styles.fields}>
        <Controller
          control={control}
          name="currentPassword"
          rules={{ required: 'Informe sua senha atual.' }}
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Senha atual (temporária)"
              placeholder="Sua senha"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.currentPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: 'Informe a nova senha.',
            minLength: { value: 8, message: 'A nova senha deve ter pelo menos 8 caracteres.' },
          }}
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Nova senha"
              placeholder="Mínimo de 8 caracteres"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.newPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          rules={{
            required: 'Confirme a nova senha.',
            validate: (value) => value === getValues('newPassword') || 'As senhas não coincidem.',
          }}
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.confirmNewPassword?.message}
            />
          )}
        />

        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}
      </View>

      <Button title="Salvar e continuar" onPress={handleSubmit(submit)} loading={submitting} style={styles.submitButton} />
    </ScrollView>
  );
}
