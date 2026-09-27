import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";
import { fontSizes } from "../../theme/typography";

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
  badgeSuccess: {
    backgroundColor: colors.successBg,
  },
  badgeSky: {
    backgroundColor: colors.skyBg,
  },
  badgeNeutral: {
    backgroundColor: colors.neutralBg,
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
  textSuccess: {
    color: colors.success,
  },
  textSky: {
    color: colors.skyInk,
  },
  textNeutral: {
    color: colors.neutralInk,
  },
});
