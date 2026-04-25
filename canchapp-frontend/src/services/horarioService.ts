// src/services/horarioService.ts
import api from './api';

export const obtenerHorariosPorEstablecimiento = async (establecimientoId: number) => {
    try {
        const response = await api.get(`/horario/establecimiento/${establecimientoId}`);
        // ¡Sacamos la lista de adentro del objectResponse! (Y ponemos [] por si viene vacío)
        return response.data.objectResponse || [];
    } catch (error) {
        console.error(`Error en horarios (${establecimientoId}):`, error);
        throw error;
    }
};