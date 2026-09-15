import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";
import { fontSizes } from "../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.ink,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  inputWrapperMultiline: {
    alignItems: "flex-start",
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.lg,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
});
