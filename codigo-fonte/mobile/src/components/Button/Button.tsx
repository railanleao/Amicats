import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '../Text';
import { colors } from '../../theme/colors';
import { styles } from './Button.styles';

type ButtonVariant = 'primary' | 'outline' | 'danger';

const VARIANT_STYLES: Record<ButtonVariant, ViewStyle> = {
  primary: styles.buttonPrimary,
  outline: styles.buttonOutline,
  danger: styles.buttonDanger,
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  const isFilled = variant !== 'outline';

  return (
    <TouchableOpacity
      style={[styles.button, VARIANT_STYLES[variant], isDisabled ? styles.buttonDisabled : null, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? colors.onPrimary : colors.ink} />
      ) : (
        <Text style={isFilled ? styles.textPrimary : styles.textOutline}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
