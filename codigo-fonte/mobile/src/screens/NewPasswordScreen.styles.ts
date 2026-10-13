import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii } from '../theme/spacing';
import { fontSizes } from '../theme/typography';
import { DISPLAY_FONT } from '../theme/fonts';

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.sage900,
  },
  headerText: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: fontSizes.xxl + 4,
    fontWeight: '600',
    lineHeight: 30,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    lineHeight: 20,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  fields: {
    gap: 24,
  },
  generalError: {
    fontSize: fontSizes.md,
    color: colors.danger,
  },
  submitButton: {
    marginTop: 8,
  },
});
