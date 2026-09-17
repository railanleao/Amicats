import { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { styles } from "./AuthScreenLayout.styles";

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  centerHeader?: boolean;
  children: ReactNode;
}

export function AuthScreenLayout({
  title,
  subtitle,
  centerHeader = false,
  children,
}: AuthScreenLayoutProps) {
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
            source={require("../../../assets/logo-amicats.png")}
            style={styles.logo}
          />
        </View>

        <View style={[styles.header, centerHeader && styles.headerCentered]}>
          <Text style={[styles.title, centerHeader && styles.textCentered]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, centerHeader && styles.textCentered]}>
            {subtitle}
          </Text>
        </View>

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
