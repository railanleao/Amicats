import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface StatusBadgeProps {
  label: string;
  tone: "warning" | "danger";
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        tone === "danger" ? styles.badgeDanger : styles.badgeWarning,
      ]}
    >
      <Text
        style={[
          styles.text,
          tone === "danger" ? styles.textDanger : styles.textWarning,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.sm,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
  },
  badgeWarning: {
    backgroundColor: colors.warningBg,
  },
  badgeDanger: {
    backgroundColor: colors.dangerBg,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textWarning: {
    color: colors.warning,
  },
  textDanger: {
    color: colors.danger,
  },
});
