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
import { isValidEmail } from "../utils/validation";
import { styles } from "./ForgotPasswordScreen.styles";

interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordScreen({
  onBackToLogin,
}: ForgotPasswordScreenProps) {
  const [linkSent, setLinkSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: "" },
  });

  function onSubmit() {
    setLinkSent(true);
  }

  return (
    <AuthScreenLayout
      title="Recuperar senha"
      subtitle="Informe o e-mail cadastrado. Vamos enviar um link para você criar uma nova senha."
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
              onChangeText={(text) => {
                onChange(text);
                setLinkSent(false);
              }}
              error={errors.email?.message}
            />
          )}
        />

        {linkSent ? (
          <Text style={styles.confirmation}>
            Se esse e-mail estiver cadastrado, enviaremos um link de recuperação
            em instantes.
          </Text>
        ) : null}

        <Button
          title="Enviar link de recuperação"
          onPress={handleSubmit(onSubmit)}
        />

        <LinkButton
          title="Voltar para o login"
          onPress={onBackToLogin}
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
