import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

interface LinkButtonProps {
  title: string;
  onPress: () => void;
  align?: "flex-end" | "center";
  tone?: "primary" | "muted";
  style?: ViewStyle;
}

export function LinkButton({
  title,
  onPress,
  align = "center",
  tone = "primary",
  style,
}: LinkButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[{ alignSelf: align }, style]}>
      <Text style={[styles.text, tone === "muted" ? styles.textMuted : null]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  textMuted: {
    color: colors.inkSoft,
  },
});
