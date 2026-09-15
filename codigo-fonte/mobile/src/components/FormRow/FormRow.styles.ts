import { StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
});
