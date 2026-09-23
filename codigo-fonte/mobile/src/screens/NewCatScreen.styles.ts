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
  photoSection: {
    gap: spacing.sm,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  photoSectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  photoSectionHint: {
    fontSize: fontSizes.xs,
    color: colors.inkFaint,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addPhotoTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 64,
    height: 64,
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
  photoPlaceholder: {
    // No token for Paper's "surface-inset" — infoBg is the closest existing
    // muted fill that still reads against both the page and white cards.
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.infoBg,
  },
  generalError: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
});
