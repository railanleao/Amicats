import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { InfoBanner } from "../components/InfoBanner";
import { LinkButton } from "../components/LinkButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { ApiError } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { LoginCredentials } from "../types/auth";
import { isValidEmail } from "../utils/validation";

interface LoginScreenProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onForgotPassword: () => void;
}

export function LoginScreen({ onLogin, onForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const isEmailValid = isValidEmail(email);

    setEmailError(isEmailValid ? undefined : "Informe um e-mail válido.");
    setPasswordError(password.length === 0 ? "Informe sua senha." : undefined);

    return isEmailValid && password.length > 0;
  }

  async function handleSubmit() {
    setGeneralError(undefined);
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onLogin({ email: email.trim(), senha: password });
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

  return (
    <AuthScreenLayout
      title="Entrar"
      subtitle="Use o e-mail cadastrado pela administração da ONG."
    >
      <View style={styles.form}>
        <TextField
          label="E-mail"
          placeholder="voce@amicats.org.br"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />

        <TextField
          label="Senha"
          placeholder="Sua senha"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={passwordError}
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

        <PrimaryButton
          title="Entrar"
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>

      <InfoBanner
        icon="shield-checkmark-outline"
        text="Acesso restrito à equipe da ONG. Profissionais de clínicas parceiras não têm login próprio — seus registros são inseridos por um usuário interno autorizado."
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  forgotPasswordLink: {
    marginTop: -spacing.md,
  },
  generalError: {
    fontSize: 14,
    color: colors.danger,
  },
});
