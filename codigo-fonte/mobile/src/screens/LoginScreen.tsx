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
  onEntrar: (credenciais: LoginCredentials) => Promise<void>;
  onEsqueciSenha: () => void;
}

export function LoginScreen({ onEntrar, onEsqueciSenha }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState<string>();
  const [erroSenha, setErroSenha] = useState<string>();
  const [erroGeral, setErroGeral] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  function validar(): boolean {
    const emailValido = isValidEmail(email);

    setErroEmail(emailValido ? undefined : "Informe um e-mail válido.");
    setErroSenha(senha.length === 0 ? "Informe sua senha." : undefined);

    return emailValido && senha.length > 0;
  }

  async function handleSubmit() {
    setErroGeral(undefined);
    if (!validar()) {
      return;
    }

    setEnviando(true);
    try {
      await onEntrar({ email: email.trim(), senha });
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 401) {
        setErroGeral("E-mail ou senha incorretos.");
      } else {
        setErroGeral(
          erro instanceof ApiError ? erro.message : "Não foi possível entrar.",
        );
      }
    } finally {
      setEnviando(false);
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
          error={erroEmail}
        />

        <TextField
          label="Senha"
          placeholder="Sua senha"
          isPassword
          value={senha}
          onChangeText={setSenha}
          error={erroSenha}
        />

        <LinkButton
          title="Esqueci minha senha"
          onPress={onEsqueciSenha}
          align="flex-end"
          style={styles.linkEsqueciSenha}
        />

        {erroGeral ? <Text style={styles.erroGeral}>{erroGeral}</Text> : null}

        <PrimaryButton
          title="Entrar"
          onPress={handleSubmit}
          loading={enviando}
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
  linkEsqueciSenha: {
    marginTop: -spacing.md,
  },
  erroGeral: {
    fontSize: 14,
    color: colors.danger,
  },
});
