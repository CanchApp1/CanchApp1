import api from './api';
import { fechaLocal } from '../utils/fecha';

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

export const obtenerIngresosDia = async (): Promise<number> => {
    const hoy = fechaLocal();
    try {
        const response = await api.get('/metricas/ingresos', { params: { fechaInicio: hoy, fechaFin: hoy } });
        return Number(response.data?.totalIngresos ?? 0);
    } catch {
        return 0;
    }
};

export const obtenerIngresosSemana = async (): Promise<number> => {
    const now = new Date();
    const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const lunes = new Date(now);
    lunes.setDate(now.getDate() - diff);
    try {
        const response = await api.get('/metricas/ingresos', {
            params: { fechaInicio: fechaLocal(lunes), fechaFin: fechaLocal(now) },
        });
        return Number(response.data?.totalIngresos ?? 0);
    } catch {
        return 0;
    }
};

export const obtenerIngresosMesAnterior = async (): Promise<number> => {
    const now = new Date();
    const primerDiaMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);
    const fechaInicio = fechaLocal(primerDiaMesAnterior);
    const fechaFin = fechaLocal(ultimoDiaMesAnterior);
    try {
        const response = await api.get('/metricas/ingresos', { params: { fechaInicio, fechaFin } });
        return Number(response.data?.totalIngresos ?? 0);
    } catch {
        return 0;
    }
};
