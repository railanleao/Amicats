import { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  logoSize?: number;
  titleAlign?: "left" | "center";
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  children: ReactNode;
}

export function AuthScreenLayout({
  title,
  subtitle,
  logoSize = 140,
  titleAlign = "left",
  titleStyle,
  subtitleStyle,
  children,
}: AuthScreenLayoutProps) {
  const alignStyle = titleAlign === "center" ? styles.textCenter : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/logo-amicats.png")}
            style={{ width: logoSize, height: logoSize, resizeMode: "contain" }}
          />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, alignStyle, titleStyle]}>{title}</Text>
          <Text style={[styles.subtitle, alignStyle, subtitleStyle]}>
            {subtitle}
          </Text>
        </View>

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.xl,
  },
  logoWrapper: {
    alignItems: "center",
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: "500",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
  },
  textCenter: {
    textAlign: "center",
  },
});
