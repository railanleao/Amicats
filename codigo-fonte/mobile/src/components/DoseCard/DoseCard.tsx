import { Text, View } from "react-native";
import { StatusBadge } from "../StatusBadge";
import { styles } from "./DoseCard.styles";

interface DoseCardProps {
  catName: string;
  medication: string;
  time: string;
  dosage: string;
  status: "pending" | "late";
}

export function DoseCard({
  catName,
  medication,
  time,
  dosage,
  status,
}: DoseCardProps) {
  const isLate = status === "late";

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>
          {catName} · {medication}
        </Text>
        <Text style={styles.subtitle}>
          {time} · {dosage}
        </Text>
      </View>
      <StatusBadge
        label={isLate ? "Atrasada" : "Pendente"}
        tone={isLate ? "danger" : "warning"}
      />
    </View>
  );
}
