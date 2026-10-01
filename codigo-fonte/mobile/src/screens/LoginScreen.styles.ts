import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

export const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  forgotPasswordLink: {
    marginTop: -spacing.md,
  },
  generalError: {
    fontSize: fontSizes.md,
    color: colors.danger,
  },
});
