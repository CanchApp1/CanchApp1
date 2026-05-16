import api from "./api";


export interface SolicitudCorreoDTO { correo: string; }
export interface ValidarCodigoDTO { correo: string; codigo: string; }
export interface RestablecerPasswordDTO { correo: string; codigo: string; nuevaContrasena: string; }

// Definimos la estructura del usuario según lo que devuelve tu backend
export type UsuarioData = {
    usuarioId: number;
    nombre: string;
    correo: string;
    numeroTelefono: string;
    fechaNacimiento: string;
    edad: number;
    perfil: {
        nombre: string;
        codigo: string;
    };
};

/**
 * Obtiene el detalle completo de un usuario por su ID
 * Útil para obtener el teléfono que no viene en el JWT
 */
export const obtenerUsuarioPorId = async (userId: number) => {
    try {
        const response = await api.get(`/usuarios/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener detalle del usuario:", error);
        throw error;
    }
};

export const obtenerMiPerfil = async (): Promise<UsuarioData> => {
    const response = await api.get('/usuarios/mi-perfil');
    return response.data;
};

export const actualizarMiPerfil = async (data: {
    nombre: string;
    correo: string;
    numeroTelefono: string;
    contrasena?: string;
}) => {
    const response = await api.put('/usuarios/mi-perfil', data);
    return response.data;
};

export const passwordService = {
  // 1. Enviar correo con código
  solicitar: async (dto: SolicitudCorreoDTO) => {
    const response = await api.post("/auth/password/solicitar", dto);
    return response.data;
  },
  // 2. Validar si el código es correcto
  validar: async (dto: ValidarCodigoDTO) => {
    const response = await api.post("/auth/password/validar", dto);
    return response.data; // Devuelve boolean
  },
  // 3. Cambiar la contraseña finalmente
  restablecer: async (dto: RestablecerPasswordDTO) => {
    const response = await api.post("/auth/password/restablecer", dto);
    return response.data;
  }
};