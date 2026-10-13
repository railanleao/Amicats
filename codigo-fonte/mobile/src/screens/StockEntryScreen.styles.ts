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

currentItemCard: {
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radii.md,
  padding: spacing.md,
  gap: spacing.sm,
},

currentItemLabel: {
  fontSize: fontSizes.xs,
  fontWeight: '700',
  color: colors.inkSoft,
},

currentItemHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing.sm,
},

currentItemName: {
  flex: 1,
  fontSize: fontSizes.md,
  fontWeight: '700',
  color: colors.ink,
},

currentItemDetails: {
  gap: spacing.xs,
},

currentItemDetail: {
  fontSize: fontSizes.sm,
  color: colors.inkSoft,
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
    padding: spacing.lg,
    gap: spacing.lg,
  },

  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },

  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },

  generalError: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  footerButton: {
    flex: 1,
  },
});
