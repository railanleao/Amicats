import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

export const styles = StyleSheet.create({
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
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  textWarning: {
    color: colors.warning,
  },
  textDanger: {
    color: colors.danger,
  },
});
