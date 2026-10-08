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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: fontSizes.xxl,
    fontWeight: '600',
    color: colors.ink,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  statusCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sage100,
  },
  statusIconWarning: {
    backgroundColor: colors.warningBg,
  },
  statusTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  statusSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  statusDiagnostic: {
    fontSize: fontSizes.sm,
    color: colors.warning,
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.ink,
  },
  itemSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  itemError: {
    fontSize: fontSizes.xs,
    color: colors.danger,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    fontSize: fontSizes.md,
    color: colors.inkSoft,
    paddingVertical: spacing.md,
  },
});
