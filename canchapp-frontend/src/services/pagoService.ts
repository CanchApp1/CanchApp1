import api from './api';

export const obtenerPagosPorEstablecimiento = async (establecimientoId: number): Promise<any[]> => {
    try {
        const response = await api.get(`/pagos/establecimiento/${establecimientoId}`);
        const data = response.data?.objectResponse ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener pagos del establecimiento:', error);
        return [];
    }
};
