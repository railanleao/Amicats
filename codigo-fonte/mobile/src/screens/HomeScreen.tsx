import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DoseCard, InfoBanner, SectionLabel } from '../components';
import { colors } from '../theme/colors';
import { formatLongDate } from '../utils/date';
import type { User } from '../types/auth';
import { styles } from './HomeScreen.styles';

interface HomeScreenProps {
  user: User;
  onNewCat: () => void;
}

// dados falsos até o dashboard (RF-014), e o registro de doses (RF-009) e os contatos
// (RF-003, RF-013) estarem implementados.  Trocar quando tudo estiver funcionando.
const PENDING_DOSES = [
  {
    catName: 'Mia',
    medication: 'Amoxicilina 250mg',
    time: '12:00',
    dosage: '1 comprimido VO',
    status: 'pending' as const,
  },
  {
    catName: 'Zeca',
    medication: 'Meloxicam',
    time: '07:30',
    dosage: '0,3 ml VO',
    status: 'late' as const,
  },
];

const CONTACT_BANKS = [
  {
    icon: 'people-outline' as const,
    title: 'Banco de voluntários',
    subtitle: '18 ativos · transporte, cuidados e eventos',
  },
  {
    icon: 'business-outline' as const,
    title: 'Instituições parceiras',
    subtitle: '3 parceiras · clínicas, ONGs e transporte',
  },
];

function firstName(fullName: string): string {
  return fullName.split(' ')[0];
}

export function HomeScreen({ user, onNewCat }: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {firstName(user.fullName)}</Text>
        <Text style={styles.date}>{formatLongDate(new Date())}</Text>
      </View>

      <View style={styles.section}>
        <SectionLabel>Doses pendentes agora</SectionLabel>
        {PENDING_DOSES.map((dose) => (
          <DoseCard key={`${dose.catName}-${dose.medication}`} {...dose} />
        ))}
      </View>

      <InfoBanner icon="alert-circle-outline" text="Estoque baixo — Doramectina injetável, 0 unidades." />

      <View style={styles.section}>
        <SectionLabel>Atalhos</SectionLabel>
        <TouchableOpacity style={styles.shortcutButton} onPress={onNewCat} accessibilityRole="button">
          <Text style={styles.shortcutText}>+ Novo gato</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shortcutButton} accessibilityRole="button">
          <Text style={styles.shortcutText}>+ Nova prescrição</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <SectionLabel>Bancos de contatos</SectionLabel>
        {CONTACT_BANKS.map((bank) => (
          <TouchableOpacity key={bank.title} style={styles.contactRow} accessibilityRole="button">
            <Ionicons name={bank.icon} size={20} color={colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{bank.title}</Text>
              <Text style={styles.contactSubtitle}>{bank.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
