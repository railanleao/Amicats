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
  stepContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  stepBody: {
    gap: spacing.lg,
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
  photoSection: {
    gap: spacing.sm,
  },
  photoSectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  addPhotoTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addPhotoLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primary,
  },
  photoPreview: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.infoBg,
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
