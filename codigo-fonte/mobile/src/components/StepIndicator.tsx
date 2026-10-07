import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSizes } from '../theme/typography';

interface StepIndicatorProps {
  titles: string[];
  current: number;
}

export function StepIndicator({ titles, current }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {titles.map((title, index) => (
          <View key={title} style={[styles.bar, index <= current ? styles.barActive : null]} />
        ))}
      </View>
      <Text style={styles.caption}>
        Etapa {current + 1} de {titles.length} · {titles[current]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  barActive: {
    backgroundColor: colors.primary,
  },
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.inkSoft,
  },
});
