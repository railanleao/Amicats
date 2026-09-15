import { Text } from "react-native";
import { styles } from "./SectionLabel.styles";

interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}
