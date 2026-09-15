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
  children: ReactNode;
}

export function AuthScreenLayout({
  title,
  subtitle,
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

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
