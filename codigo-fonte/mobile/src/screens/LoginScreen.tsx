import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import {
  AuthScreenLayout,
  Button,
  InfoBanner,
  LinkButton,
  TextField,
} from "../components";
import { ApiError } from "../services/api";
import { DEV_CREDENTIALS } from "../services/authService";
import type { LoginCredentials } from "../types/auth";
import { isValidEmail } from "../utils/validation";
import { styles } from "./LoginScreen.styles";

interface LoginScreenProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onForgotPassword: () => void;
}

export function LoginScreen({ onLogin, onForgotPassword }: LoginScreenProps) {
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: { email: "", password: "" },
  });

  async function submitLogin(credentials: LoginCredentials) {
    setGeneralError(undefined);
    setSubmitting(true);
    try {
      await onLogin(credentials);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setGeneralError("E-mail ou senha incorretos.");
      } else {
        setGeneralError(
          error instanceof ApiError
            ? error.message
            : "Não foi possível entrar.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(values: LoginCredentials) {
    submitLogin({ email: values.email.trim(), password: values.password });
  }

  return (
    <AuthScreenLayout
      title="Entrar"
      subtitle="Use o e-mail cadastrado pela administração da ONG."
      centerHeader
    >
      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          rules={{
            validate: (value) =>
              isValidEmail(value) || "Informe um e-mail válido.",
          }}
          render={({ field: { value, onChange } }) => (
            <TextField
              label="E-mail"
              placeholder="voce@amicats.org.br"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: "Informe sua senha." }}
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Senha"
              placeholder="Sua senha"
              isPassword
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <LinkButton
          title="Esqueci minha senha"
          onPress={onForgotPassword}
          align="flex-end"
          style={styles.forgotPasswordLink}
        />

        {generalError ? (
          <Text style={styles.generalError}>{generalError}</Text>
        ) : null}

        <Button
          title="Entrar"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />

        {__DEV__ ? (
          <LinkButton
            title="Entrar como dev"
            onPress={() => submitLogin(DEV_CREDENTIALS)}
            tone="muted"
          />
        ) : null}
      </View>

      <InfoBanner
        icon="shield-outline"
        text="Acesso restrito à equipe da ONG. Clínicas parceiras não têm login próprio."
      />
    </AuthScreenLayout>
  );
}
