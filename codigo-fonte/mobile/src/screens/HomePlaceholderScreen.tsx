import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { Usuario } from "../types/auth";

interface HomePlaceholderScreenProps {
  usuario: Usuario;
  onSair: () => void;
}

export function HomePlaceholderScreen({
  usuario,
  onSair,
}: HomePlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Olá, {usuario.nomeCompleto}</Text>
      <Text style={styles.subtitulo}>{usuario.tipoAcesso}</Text>
      <PrimaryButton title="Sair" onPress={onSair} style={styles.botaoSair} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.ink,
  },
  subtitulo: {
    fontSize: 15,
    color: colors.inkSoft,
    marginBottom: spacing.lg,
  },
  botaoSair: {
    minWidth: 160,
  },
});
