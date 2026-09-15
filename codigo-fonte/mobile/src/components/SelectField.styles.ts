import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  value: {
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  placeholder: {
    fontSize: fontSizes.md,
    color: colors.inkFaint,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.lg,
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 4,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: fontSizes.lg,
    color: colors.ink,
  },
});
