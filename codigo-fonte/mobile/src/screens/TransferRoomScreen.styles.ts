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
    gap: spacing.md + 4,
  },
  feedback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  feedbackText: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  currentRoomCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  currentRoomTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.ink,
  },
  currentRoomSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  section: {
    gap: spacing.sm + 2,
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  roomRowSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  roomInfo: {
    gap: 2,
  },
  roomTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.ink,
  },
  roomSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.inkSoft,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: colors.border,
    borderWidth: 2,
    flexShrink: 0,
  },
  radioOuterSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  reasonInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.sm,
    padding: spacing.md,
    minHeight: 80,
    fontSize: fontSizes.sm,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
