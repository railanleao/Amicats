import { Text, View } from "react-native";
import { styles } from "./StatusBadge.styles";

export type StatusBadgeTone = "warning" | "danger" | "success" | "sky" | "neutral";

interface StatusBadgeProps {
  label: string;
  tone: StatusBadgeTone;
}

const BADGE_STYLE_BY_TONE: Record<StatusBadgeTone, [object, object]> = {
  warning: [styles.badgeWarning, styles.textWarning],
  danger: [styles.badgeDanger, styles.textDanger],
  success: [styles.badgeSuccess, styles.textSuccess],
  sky: [styles.badgeSky, styles.textSky],
  neutral: [styles.badgeNeutral, styles.textNeutral],
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const [badgeStyle, textStyle] = BADGE_STYLE_BY_TONE[tone];

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
}
