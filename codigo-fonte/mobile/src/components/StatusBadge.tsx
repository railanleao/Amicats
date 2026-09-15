import { Text, View } from "react-native";
import { styles } from "./StatusBadge.styles";

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
