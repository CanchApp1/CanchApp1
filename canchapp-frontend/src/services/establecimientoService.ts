import api from './api';

// 1. ESTO LO USA EL JUGADOR (useCanchas.ts)
export const obtenerEstablecimientos = async () => {
    const response = await api.get('/establecimiento');
    return response.data; // El jugador suele necesitar la respuesta completa para filtros
};

// 2. ESTO LO USA EL ADMIN (DashboardPropietario)
export const obtenerMiEstablecimiento = async (userId: number) => {
    try {
        const response = await api.get('/establecimiento');
        const lista = response.data.objectResponse || [];

        // Buscamos cuál tiene el idUsuario que recibimos (el 19 en tu caso)
        const miLocal = lista.find((est: any) => est.usuario?.idUsuario === userId);

        return miLocal; // Esto devuelve el objeto con el establecimientoId: 7
    } catch (error) {
        console.error("Error al obtener mi local:", error);
        return null;
    }
};
