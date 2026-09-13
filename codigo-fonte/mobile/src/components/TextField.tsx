import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function TextField({
  label,
  error,
  isPassword,
  style,
  ...inputProps
}: TextFieldProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.inkFaint}
          secureTextEntry={isPassword && !senhaVisivel}
          {...inputProps}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setSenhaVisivel((visivel) => !visivel)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              senhaVisivel ? "Ocultar senha" : "Mostrar senha"
            }
          >
            <Ionicons
              name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.inkSoft}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
});
