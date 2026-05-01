import api from './api';

// ============================================
// SERVICIO DE HORARIOS — Comunicación con el Backend
// ============================================

// 1. OBTENER horarios por establecimiento (READ)
export const obtenerHorariosPorEstablecimiento = async (establecimientoId: number) => {
    try {
        const response = await api.get(`/v1/api/horario/establecimiento/${establecimientoId}`);
        return response.data.objectResponse || [];
    } catch (error) {
        console.error(`Error obteniendo horarios (${establecimientoId}):`, error);
        throw error;
    }
};

// 2. CREAR un horario nuevo (CREATE)
export const crearHorario = async (datos: {
    diaSemana: string;
    horaApertura: string;
    horaCierre: string;
    establecimiento: { establecimientoId: number };
    usuarioCreacion: string;
}) => {
    try {
        const response = await api.post('/v1/api/horario', datos);
        return response.data;
    } catch (error) {
        console.error('Error creando horario:', error);
        throw error;
    }
};

// 3. ACTUALIZAR un horario existente (UPDATE)
export const actualizarHorario = async (horarioId: number, datos: {
    diaSemana: string;
    horaApertura: string;
    horaCierre: string;
    establecimiento: { establecimientoId: number };
    usuarioModificacion: string;
}) => {
    try {
        const response = await api.put(`/v1/api/horario/${horarioId}`, datos);
        return response.data;
    } catch (error) {
        console.error('Error actualizando horario:', error);
        throw error;
    }
};

// 4. ELIMINAR un horario (DELETE)
export const eliminarHorario = async (horarioId: number) => {
    try {
        const response = await api.delete(`/v1/api/horario/${horarioId}`);
        return response.data;
    } catch (error) {
        console.error('Error eliminando horario:', error);
        throw error;
    }
};