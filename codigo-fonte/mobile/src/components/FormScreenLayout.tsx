import { ReactNode } from "react";
import { ScrollView } from "react-native";
import { styles } from "./FormScreenLayout.styles";

interface FormScreenLayoutProps {
  children: ReactNode;
}

export function FormScreenLayout({ children }: FormScreenLayoutProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
  );
}
