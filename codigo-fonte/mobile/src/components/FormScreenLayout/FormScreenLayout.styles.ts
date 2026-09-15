import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
});
