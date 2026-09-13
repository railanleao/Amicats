import { useCallback, useEffect, useState } from "react";
import { login as loginRequest } from "../services/authService";
import { limparSessao, obterSessao, salvarSessao } from "../storage/authStorage";
import type { LoginCredentials, Usuario } from "../types/auth";

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    obterSessao()
      .then((sessao) => setUsuario(sessao?.usuario ?? null))
      .finally(() => setCarregandoSessao(false));
  }, []);

  const entrar = useCallback(async (credenciais: LoginCredentials) => {
    const resposta = await loginRequest(credenciais);
    await salvarSessao(resposta);
    setUsuario(resposta.usuario);
  }, []);

  const sair = useCallback(async () => {
    await limparSessao();
    setUsuario(null);
  }, []);

  return { usuario, carregandoSessao, entrar, sair };
}
