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
    flex: 1,
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
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  feedbackText: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.ink,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  infoValue: {
    flexShrink: 1,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'right',
  },
  link: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  block: {
    gap: 2,
  },
  blockText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  actions: {
    gap: spacing.sm,
  },
  changeItem: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  changeAction: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
  },
  changeDetail: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  changeMeta: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
});
