import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { fontSizes } from "../../theme/typography";

export const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
});
