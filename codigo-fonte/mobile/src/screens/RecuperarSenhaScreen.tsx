import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { InfoBanner } from "../components/InfoBanner";
import { LinkButton } from "../components/LinkButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { isValidEmail } from "../utils/validation";

interface RecuperarSenhaScreenProps {
  onVoltarLogin: () => void;
}

export function RecuperarSenhaScreen({
  onVoltarLogin,
}: RecuperarSenhaScreenProps) {
  const [email, setEmail] = useState("");
  const [erroEmail, setErroEmail] = useState<string>();
  const [linkEnviado, setLinkEnviado] = useState(false);

  function handleSubmit() {
    const emailValido = isValidEmail(email);
    setErroEmail(emailValido ? undefined : "Informe um e-mail válido.");
    setLinkEnviado(emailValido);
  }

  return (
    <AuthScreenLayout
      title="Recuperar senha"
      subtitle="Informe o e-mail cadastrado. Vamos enviar um link para você criar uma nova senha."
      logoSize={76}
      titleAlign="center"
      titleStyle={styles.title}
      subtitleStyle={styles.subtitle}
    >
      <View style={styles.form}>
        <TextField
          label="E-mail"
          placeholder="voce@amicats.org.br"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(texto) => {
            setEmail(texto);
            setLinkEnviado(false);
          }}
          error={erroEmail}
        />

        {linkEnviado ? (
          <Text style={styles.confirmacao}>
            Se esse e-mail estiver cadastrado, enviaremos um link de recuperação
            em instantes.
          </Text>
        ) : null}

        <PrimaryButton
          title="Enviar link de recuperação"
          onPress={handleSubmit}
        />

        <LinkButton
          title="Voltar para o login"
          onPress={onVoltarLogin}
          tone="muted"
        />
      </View>

      <InfoBanner
        icon="information-circle-outline"
        text="Sem acesso a esse e-mail? Peça para o Administrador redefinir sua senha diretamente pelo painel de usuários."
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: spacing.lg,
  },
  confirmacao: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary,
  },
});
