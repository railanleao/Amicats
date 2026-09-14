import { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface FormScreenLayoutProps {
  children: ReactNode;
}

export function FormScreenLayout({ children }: FormScreenLayoutProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
});
