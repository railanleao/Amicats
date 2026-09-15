import { Text, View } from "react-native";
import { styles } from "./ReadOnlyField.styles";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}
