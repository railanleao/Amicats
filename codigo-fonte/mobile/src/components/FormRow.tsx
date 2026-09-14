import { Children, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "../theme/spacing";

interface FormRowProps {
  children: ReactNode;
}

export function FormRow({ children }: FormRowProps) {
  return (
    <View style={styles.row}>
      {Children.map(children, (child) => (
        <View style={styles.rowItem}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
});
