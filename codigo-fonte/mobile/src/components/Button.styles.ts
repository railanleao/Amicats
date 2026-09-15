import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

export const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
  },
  buttonOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    padding: spacing.md + 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textPrimary: {
    color: colors.onPrimary,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  textOutline: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.ink,
  },
});
