import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes } from '../theme/typography';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.ink,
  },
  readonlyField: {
    gap: spacing.xs + 2,
  },
  readonlyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  readonlyBox: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  readonlyValue: {
    fontSize: 15,
    color: colors.ink,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
  },
  toggleHint: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  generalError: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
