import { forwardRef } from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';
import type { TextProps } from 'react-native';
import { resolveFontFamily } from '../../theme/fonts';

export const Text = forwardRef<NativeText, TextProps>(function Text({ style, ...props }, ref) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontFamily = resolveFontFamily(flat.fontFamily, flat.fontWeight);

  return <NativeText ref={ref} {...props} style={fontFamily ? [style, { fontFamily, fontWeight: 'normal' }] : style} />;
});
