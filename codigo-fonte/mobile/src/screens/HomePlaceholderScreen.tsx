import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { User } from "../types/auth";

interface HomePlaceholderScreenProps {
  user: User;
  onLogout: () => void;
}

export function HomePlaceholderScreen({
  user,
  onLogout,
}: HomePlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user.fullName}</Text>
      <Text style={styles.subtitle}>{user.accessType}</Text>
      <Button
        variant="outline"
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
