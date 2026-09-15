import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

export const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  info: {
    gap: 2,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.ink,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
});
