import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface StatusBarInsetProps {
  children: ReactNode;
}

export function StatusBarInset({ children }: StatusBarInsetProps) {
  const insets = useSafeAreaInsets();

  return <View style={[styles.container, { paddingTop: insets.top }]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
