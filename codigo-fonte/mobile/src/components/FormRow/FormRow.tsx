import { Children, ReactNode } from "react";
import { View } from "react-native";
import { styles } from "./FormRow.styles";

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
