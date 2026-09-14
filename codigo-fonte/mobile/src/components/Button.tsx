import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";
import { fontSizes } from "../theme/typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonOutline,
        isDisabled ? styles.buttonDisabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.ink} />
      ) : (
        <Text style={isPrimary ? styles.textPrimary : styles.textOutline}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
  },
  buttonOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    padding: spacing.md + 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textPrimary: {
    color: colors.onPrimary,
    fontSize: fontSizes.lg,
    fontWeight: "700",
  },
  textOutline: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.ink,
  },
});
