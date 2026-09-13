import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { Usuario } from "../types/auth";

interface HomePlaceholderScreenProps {
  user: Usuario;
  onLogout: () => void;
}

export function HomePlaceholderScreen({
  user,
  onLogout,
}: HomePlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user.nomeCompleto}</Text>
      <Text style={styles.subtitle}>{user.tipoAcesso}</Text>
      <PrimaryButton
        title="Sair"
        onPress={onLogout}
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    color: colors.inkSoft,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    minWidth: 160,
  },
});
