import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";
import { fontSizes } from "../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: fontSizes.sm,
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
    fontSize: fontSizes.md,
    color: colors.ink,
  },
});
