import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Checkbox } from "../components";
import { ApiError } from "../services/api";
import { colors } from "../theme/colors";
import { radii } from "../theme/spacing";

interface TermsAcceptanceScreenProps {
  onContinue: () => Promise<void>;
}

export function TermsAcceptanceScreen({
  onContinue,
}: TermsAcceptanceScreenProps) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleContinue() {
    setError(undefined);
    setSubmitting(true);
    try {
      await onContinue();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível registrar o aceite. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name="paw" size={22} color={colors.background} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Termos de uso e responsabilidade</Text>
          <Text style={styles.subtitle}>
            Leia com atenção antes de continuar.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.paragraph}>
          Ao acessar o Amicats, você concorda em manter a confidencialidade dos
          dados de gatos, adotantes e voluntários, conforme a LGPD.
        </Text>
        <Text style={styles.paragraph}>
          Todo registro clínico preserva autor, data e hora, sem edição
          silenciosa (Resolução CFMV nº 1.321/2020).
        </Text>
        <Text style={styles.paragraph}>
          O uso da câmera e do armazenamento do dispositivo depende de permissão
          explícita concedida por você.
        </Text>
      </View>

      <Checkbox
        label="Li e aceito os termos."
        checked={accepted}
        onToggle={() => setAccepted((value) => !value)}
      />

      {error ? <Text style={styles.generalError}>{error}</Text> : null}

      <Button
        title="Continuar"
        onPress={handleContinue}
        disabled={!accepted}
        loading={submitting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.sage900,
  },
  headerText: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.inkSoft,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 14,
    gap: 12,
  },
  paragraph: {
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.ink,
  },
  generalError: {
    fontSize: 13,
    color: colors.danger,
  },
});
