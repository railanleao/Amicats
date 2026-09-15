import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./Checkbox.styles";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function Checkbox({ label, checked, onToggle }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked ? styles.boxChecked : null]}>
        {checked ? (
          <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}
