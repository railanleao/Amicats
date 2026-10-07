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
    gap: spacing.md,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: fontSizes.xxl,
    fontWeight: '600',
    color: colors.ink,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
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
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSizes.sm - 0.5,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  chipTextActive: {
    color: colors.onPrimary,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sage300,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  retryButton: {
    marginTop: spacing.sm,
  },
});
