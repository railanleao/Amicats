import { apiRequest } from "./api";
import type { LoginCredentials, LoginResponse } from "../types/auth";

// Login fake para testar o app sem o backend de autenticação real.
// Remover quando o endpoint real (`POST /auth/login`) estiver disponível.
export const DEV_CREDENTIALS: LoginCredentials = {
  email: "dev@amicats.org.br",
  senha: "dev123",
};

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  if (
    __DEV__ &&
    credentials.email === DEV_CREDENTIALS.email &&
    credentials.senha === DEV_CREDENTIALS.senha
  ) {
    return Promise.resolve(createDevResponse());
  }

  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

function createDevResponse(): LoginResponse {
  return {
    token: "dev-token",
    usuario: {
      idUsuario: 0,
      nomeCompleto: "Usuário de Teste",
      email: DEV_CREDENTIALS.email,
      telefone: null,
      fotoUrl: null,
      tipoAcesso: "ADMINISTRADOR",
      crmv: null,
      ufCrmv: null,
      dataAceiteTermos: new Date().toISOString(),
      ativo: true,
      dataCriacao: new Date().toISOString(),
    },
  };
}
