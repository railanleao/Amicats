import { StyleSheet, Text, View } from "react-native";
import { OutlineButton } from "../components/OutlineButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface ComingSoonScreenProps {
  title: string;
  onLogout: () => void;
}

export function ComingSoonScreen({ title, onLogout }: ComingSoonScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Em breve.</Text>
      <OutlineButton
        title="Sair"
        onPress={onLogout}
        style={styles.backButton}
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
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkSoft,
  },
  backButton: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
});
