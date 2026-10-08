import { View } from 'react-native';

import { StatusBadge } from '../components';
import { Text } from '../components/Text';
import {
  STOCK_STATUS_LABELS,
  STOCK_STATUS_TONE,
  type StockItem,
} from '../types/stock';
import { formatBrazilianDate } from '../utils/date';

import { styles } from './StockEntryScreen.styles';

interface StockEntryCurrentItemCardProps {
  item: StockItem;
}

export function StockEntryCurrentItemCard({
  item,
}: StockEntryCurrentItemCardProps) {
  return (
    <View style={styles.currentItemCard}>
      <Text style={styles.currentItemLabel}>
        SITUAÇÃO ATUAL DO MEDICAMENTO
      </Text>

      <View style={styles.currentItemHeader}>
        <Text style={styles.currentItemName}>
          {item.name}
        </Text>

        <StatusBadge
          label={STOCK_STATUS_LABELS[item.status]}
          tone={STOCK_STATUS_TONE[item.status]}
        />
      </View>

      <View style={styles.currentItemDetails}>
        <Text style={styles.currentItemDetail}>
          Quantidade atual: {item.quantity} {item.unit}
        </Text>

        <Text style={styles.currentItemDetail}>
          Validade:{' '}
          {item.expirationDate
            ? formatBrazilianDate(item.expirationDate)
            : 'Não informada'}
        </Text>
      </View>
    </View>
  );
}
