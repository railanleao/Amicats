import { forwardRef } from 'react';
import { StyleSheet, TextInput as NativeTextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { resolveFontFamily } from '../../theme/fonts';

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function TextInput({ style, ...props }, ref) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fontFamily = resolveFontFamily(flat.fontFamily, flat.fontWeight);

  return <NativeTextInput ref={ref} {...props} style={fontFamily ? [style, { fontFamily, fontWeight: 'normal' }] : style} />;
});
