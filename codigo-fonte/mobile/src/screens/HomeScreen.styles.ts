import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes } from '../theme/typography';
import { DISPLAY_FONT } from '../theme/fonts';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
    fontFamily: DISPLAY_FONT,
    fontSize: fontSizes.display,
    fontWeight: '600',
    color: colors.ink,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  syncRowAttention: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBg,
  },
  syncText: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
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
  occupancyCard: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  occupancyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  occupancyName: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
  occupancyCount: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  occupancyTrack: {
    height: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: radii.sm,
  },
});
