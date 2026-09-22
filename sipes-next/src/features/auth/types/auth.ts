export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

export interface RespuestaLogin {
  accessToken: string;
  user: UsuarioSesion;
}