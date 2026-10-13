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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },

  title: {
    flex: 1,
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
    flexWrap: 'wrap',
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
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.inkSoft,
  },

  chipTextActive: {
    color: colors.onPrimary,
  },

  list: {
    gap: spacing.sm + 2,
  },

  stockRow: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },

  stockRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  stockExpanded: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  stockDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  stockDetailLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.inkSoft,
  },

  stockDetailValue: {
    flex: 1,
    fontSize: fontSizes.xs,
    color: colors.ink,
    textAlign: 'right',
  },

  stockInfo: {
    flex: 1,
    gap: 2,
  },

  stockName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
  },

  stockSubtitle: {
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
    textAlign: 'center',
  },

  retryButton: {
    marginTop: spacing.sm,
  },
});
