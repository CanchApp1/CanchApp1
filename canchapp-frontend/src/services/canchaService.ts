// src/services/canchaService.ts
import api from './api'; // Ajusta la ruta según dónde esté tu api.ts

export const crearCancha = async (canchaData: {
  codigo: string;
  precioPorHora: number;
  establecimiento: { establecimientoId: number };
}) => {
  try {
    const response = await api.post('/cancha', canchaData);
    return response.data;
  } catch (error) {
    console.error("Error creando cancha:", error);
    throw error;
  }
};

export const obtenerCanchasPorEstablecimiento = async (establecimientoId: number) => {
    try {
        const response = await api.get(`/cancha/establecimiento/${establecimientoId}`);
        // ¡Sacamos la lista de adentro del objectResponse!
        return response.data.objectResponse || [];
    } catch (error) {
        console.error(`Error en canchas (${establecimientoId}):`, error);
        throw error;
    }
};

export const eliminarCancha = async (canchaId: number) => {
    try {
        const response = await api.delete(`/cancha/${canchaId}`);
        return response.data;
    } catch (error) {
        console.error("Error eliminando cancha:", error);
        throw error;
    }
};
