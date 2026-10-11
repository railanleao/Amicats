import {
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBadge } from '../components';
import { Text } from '../components/Text';
import type { StockItem } from '../types/stock';
import {
  STOCK_STATUS_LABELS,
  STOCK_STATUS_TONE,
} from '../types/stock';
import { formatBrazilianDate } from '../utils/date';

import { styles } from './StockScreen.styles';

interface StockItemCardProps {
  item: StockItem;
  expanded: boolean;
  onToggle: () => void;
}

function quantityLabel(item: StockItem): string {
  const quantity = String(item.quantity).replace('.', ',');

  return `${quantity} ${item.unit}`;
}

export function StockItemCard({
  item,
  expanded,
  onToggle,
}: StockItemCardProps) {
  return (
    <TouchableOpacity
      style={styles.stockRow}
      onPress={onToggle}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View style={styles.stockRowHeader}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockName}>{item.name}</Text>

          <Text style={styles.stockSubtitle}>
            {item.category} · {quantityLabel(item)}
          </Text>
        </View>

        <StatusBadge
          label={STOCK_STATUS_LABELS[item.status]}
          tone={STOCK_STATUS_TONE[item.status]}
        />
      </View>

      {expanded ? (
        <View style={styles.stockExpanded}>
          <View style={styles.stockDetailRow}>
            <Text style={styles.stockDetailLabel}>Validade</Text>

            <Text style={styles.stockDetailValue}>
              {item.expirationDate
                ? formatBrazilianDate(item.expirationDate)
                : 'Não informada'}
            </Text>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
