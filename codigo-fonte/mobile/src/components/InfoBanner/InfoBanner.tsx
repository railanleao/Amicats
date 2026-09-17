import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./InfoBanner.styles";

interface InfoBannerProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

export function InfoBanner({ icon, text }: InfoBannerProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={18} color={colors.sky} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
