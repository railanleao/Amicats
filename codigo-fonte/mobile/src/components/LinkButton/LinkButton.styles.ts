import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { fontSizes } from "../../theme/typography";

export const styles = StyleSheet.create({
  text: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.primary,
  },
  textMuted: {
    color: colors.inkSoft,
  },
});
