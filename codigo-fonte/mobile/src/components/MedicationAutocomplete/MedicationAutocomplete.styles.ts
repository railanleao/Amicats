import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { fontSizes } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  suggestions: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionName: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  suggestionStock: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  suggestionStockEmpty: {
    color: colors.danger,
  },
  hint: {
    fontSize: 13,
    color: colors.warning,
  },
  searchFailedText: {
    fontSize: 13,
    color: colors.inkSoft,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
  },
});
