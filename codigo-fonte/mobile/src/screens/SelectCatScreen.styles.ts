import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontSizes } from '../theme/typography';
import { DISPLAY_FONT } from '../theme/fonts';

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
    flex: 1,
    fontFamily: DISPLAY_FONT,
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.ink,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  searchBox: {
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
  searchInput: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.ink,
    padding: 0,
  },
  list: {
    gap: spacing.sm + 2,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md - 2,
  },
  catInfo: {
    flex: 1,
    gap: 2,
  },
  catName: {
    fontSize: fontSizes.md + 0.5,
    fontWeight: '600',
    color: colors.ink,
  },
  catSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  feedback: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
});
