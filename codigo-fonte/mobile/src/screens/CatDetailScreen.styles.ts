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
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md + 2,
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
  cover: {
    height: 220,
    borderRadius: radii.md,
    backgroundColor: colors.sage100,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  identity: {
    gap: spacing.xs + 2,
  },
  name: {
    fontSize: fontSizes.xxl,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm + 2,
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
    fontSize: fontSizes.sm,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  primaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    padding: spacing.md + 1,
    marginTop: spacing.xs,
  },
  primaryActionText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    padding: spacing.md + 1,
  },
  secondaryActionText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.ink,
  },
});
