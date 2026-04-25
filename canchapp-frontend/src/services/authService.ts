import api from "./api";

export type RegisterData = {
  nombre: string;
  correo: string;
  contrasena: string;
  fechaNacimiento: string;
  numeroTelefono: string;
  edad: number;
  nombrePerfil: string;
};

export const registerUsuario = async (userData: RegisterData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};


// 1. Definimos qué enviamos para el Login
export type LoginData = {
  correo: string;
  contrasena: string;
};

// 2. Creamos la función para hacer Login
export const loginUsuario = async (credentials: LoginData) => {
  const response = await api.post("/auth/login", credentials);
  return response.data; // Esto devolverá el token que te da Spring Boot
};
// agregado por Andres
// Tipo para registrar propietario
export type RegisterPropietarioData = {
  nombreEstablecimiento: string;
  direccion: string;
  numeroTelefono: string;
  usuario: {
    nombre: string;
    correo: string;
    contrasena: string;
    fechaNacimiento: string;
    numeroTelefono: string;
    edad: number;
    perfil: {
      codigo: string;
    };
  };
};

export const registerPropietario = async (userData: RegisterPropietarioData) => {
  const response = await api.post("/establecimiento", userData);
  return response.data;
};

