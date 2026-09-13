export type TipoAcesso =
  "ADMINISTRADOR" | "VETERINARIO" | "AUXILIAR" | "VISUALIZADOR";

export interface Usuario {
  idUsuario: number;
  nomeCompleto: string;
  email: string;
  fotoUrl: string | null;
  tipoAcesso: TipoAcesso;
  crmv: string | null;
  ufCrmv: string | null;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
