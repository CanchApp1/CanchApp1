import api from './api';

export const obtenerIngresosMes = async (): Promise<number> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const fechaInicio = `${year}-${month}-01`;
    const fechaFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    try {
        const response = await api.get('/metricas/ingresos', { params: { fechaInicio, fechaFin } });
        return Number(response.data?.totalIngresos ?? 0);
    } catch {
        return 0;
    }
};
