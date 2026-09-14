import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function OutlineButton({ title, onPress, style }: OutlineButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    padding: spacing.md + 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
});
