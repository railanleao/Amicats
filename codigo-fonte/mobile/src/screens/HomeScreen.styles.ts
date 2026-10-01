import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes } from '../theme/typography';

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    gap: 2,
  },
  greeting: {
    fontSize: fontSizes.display,
    fontWeight: '600',
    color: colors.ink,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  section: {
    gap: spacing.sm + 2,
  },
  shortcutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    padding: spacing.md + 1,
  },
  shortcutText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 1,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
  contactSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.inkFaint,
  },
});
