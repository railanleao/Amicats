import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

export const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  confirmation: {
    fontSize: fontSizes.md,
    lineHeight: 20,
    color: colors.primary,
  },
});
