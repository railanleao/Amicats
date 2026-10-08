import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '../Text';
import { colors } from '../../theme/colors';
import { styles } from './Button.styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.buttonPrimary : styles.buttonOutline, isDisabled ? styles.buttonDisabled : null, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.ink} />
      ) : (
        <Text style={isPrimary ? styles.textPrimary : styles.textOutline}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
