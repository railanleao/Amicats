import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.xl,
  },
  logoWrapper: {
    alignItems: "center",
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.display,
    fontWeight: "500",
    color: colors.ink,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  textCenter: {
    textAlign: "center",
  },
});
