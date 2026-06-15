import api from './api';

// ============================================
// SERVICIO DE CANCHAS — Comunicación con el Backend
// ============================================

// 1. OBTENER canchas por establecimiento (READ)
export const obtenerCanchasPorEstablecimiento = async (establecimientoId: number) => {
    try {
        const response = await api.get(`/cancha/establecimiento/${establecimientoId}`);
        return response.data.objectResponse || [];
    } catch (error) {
        throw error;
    }
};

// 2. CREAR una cancha nueva (CREATE)
export const crearCancha = async (datos: {
    codigo: string;
    estado: string;
    precioPorHora: number;
    establecimiento: { establecimientoId: number };
    usuarioCreacion: string;
}) => {
    try {
        const response = await api.post('/cancha', datos);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 3. ACTUALIZAR una cancha existente (UPDATE)
export const actualizarCancha = async (canchaId: number, datos: {
    codigo: string;
    estado: string;
    precioPorHora: number;
    establecimiento: { establecimientoId: number };
    usuarioModificacion: string;
}) => {
    try {
        const response = await api.put(`/cancha/${canchaId}`, datos);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 4. ELIMINAR una cancha (DELETE — soft delete)
export const eliminarCancha = async (canchaId: number) => {
    try {
        const response = await api.delete(`/cancha/${canchaId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 5. REACTIVAR una cancha deshabilitada
export const reactivarCancha = async (canchaId: number) => {
    try {
        const response = await api.put(`/cancha/${canchaId}/activar`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
