import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface TermsAcceptanceScreenProps {
  onContinue: () => void;
}

export function TermsAcceptanceScreen({
  onContinue,
}: TermsAcceptanceScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name="paw" size={22} color={colors.background} />
        </View>
        <Text style={styles.title}>Termos de uso e responsabilidade</Text>
        <Text style={styles.subtitle}>
          Leia com atenção antes de continuar.
        </Text>
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

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAccepted((value) => !value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
      >
        <View
          style={[styles.checkbox, accepted ? styles.checkboxChecked : null]}
        >
          {accepted ? (
            <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
          ) : null}
        </View>
        <Text style={styles.checkboxLabel}>Li e aceito os termos.</Text>
      </TouchableOpacity>

      <Button title="Continuar" onPress={onContinue} disabled={!accepted} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.sage900,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.sm + 4,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: colors.ink,
  },
});
