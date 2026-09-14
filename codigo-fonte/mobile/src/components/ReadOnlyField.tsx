import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  field: {
    backgroundColor: colors.infoBg,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  value: {
    fontSize: 14,
    color: colors.ink,
  },
});
