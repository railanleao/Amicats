import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";
import { fontSizes } from "../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 19,
    color: colors.inkSoft,
  },
});
