import api from "./api";

export interface ComentarioDTO {
  establecimientoId: number;
  comentario: string;
}

export const guardarComentario = async (data: ComentarioDTO) => {
  try {
    const response = await api.post("/comentarios", data);
    return response.data;
  } catch (error) {
    console.error("Error al guardar el comentario en el servidor:", error);
    throw error;
  }
};

export const listarComentariosPorEstablecimiento = async (establecimientoId: number) => {
  const response = await api.get(`/comentarios/establecimiento/${establecimientoId}`);
  return response.data;
};