export type TipoAcesso =
  "ADMINISTRADOR" | "VETERINARIO" | "AUXILIAR" | "VISUALIZADOR";

export interface Usuario {
  idUsuario: number;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  fotoUrl: string | null;
  tipoAcesso: TipoAcesso;
  crmv: string | null;
  ufCrmv: string | null;
  dataAceiteTermos: string | null;
  ativo: boolean;
  dataCriacao: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
