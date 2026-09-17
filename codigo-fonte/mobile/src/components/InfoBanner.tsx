import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },
});
