import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "./src/hooks/useAuth";
import { HomePlaceholderScreen } from "./src/screens/HomePlaceholderScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RecuperarSenhaScreen } from "./src/screens/RecuperarSenhaScreen";
import { colors } from "./src/theme/colors";

type TelaPublica = "login" | "recuperar-senha";

export default function App() {
  const { usuario, carregandoSessao, entrar, sair } = useAuth();
  const [telaPublica, setTelaPublica] = useState<TelaPublica>("login");

  return (
    <View style={styles.container}>
      {carregandoSessao ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : usuario ? (
        <HomePlaceholderScreen usuario={usuario} onSair={sair} />
      ) : telaPublica === "recuperar-senha" ? (
        <RecuperarSenhaScreen onVoltarLogin={() => setTelaPublica("login")} />
      ) : (
        <LoginScreen onEntrar={entrar} onEsqueciSenha={() => setTelaPublica("recuperar-senha")} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
