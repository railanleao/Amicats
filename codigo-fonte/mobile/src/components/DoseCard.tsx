import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { StatusBadge } from "./StatusBadge";

interface DoseCardProps {
  catName: string;
  medication: string;
  time: string;
  dosage: string;
  status: "pending" | "late";
}

export function DoseCard({
  catName,
  medication,
  time,
  dosage,
  status,
}: DoseCardProps) {
  const isLate = status === "late";

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>
          {catName} · {medication}
        </Text>
        <Text style={styles.subtitle}>
          {time} · {dosage}
        </Text>
      </View>
      <StatusBadge
        label={isLate ? "Atrasada" : "Pendente"}
        tone={isLate ? "danger" : "warning"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  info: {
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkSoft,
  },
});
