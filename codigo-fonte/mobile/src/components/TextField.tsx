import { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { styles } from "./TextField.styles";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function TextField({
  label,
  error,
  isPassword,
  multiline,
  style,
  ...inputProps
}: TextFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline ? styles.inputWrapperMultiline : null,
          error ? styles.inputWrapperError : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline ? styles.inputMultiline : null,
            style,
          ]}
          placeholderTextColor={colors.inkFaint}
          secureTextEntry={isPassword && !passwordVisible}
          multiline={multiline}
          {...inputProps}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setPasswordVisible((visible) => !visible)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Ocultar senha" : "Mostrar senha"
            }
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
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
