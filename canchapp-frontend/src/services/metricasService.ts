import api from './api';
import { fechaLocal } from '../utils/fecha';

export interface ClienteFrecuente {
    usuarioId: number;
    nombreCliente: string;
    totalReservas: number;
}

export interface SlotOcupacion {
    diaSemana: string;
    horaSlot: any;
    totalReservasEnSlot: number;
    porcentajeOcupacion: number;
}

const parseHoraSlot = (horaSlot: any): string => {
    if (typeof horaSlot === 'string') return horaSlot.slice(0, 5);
    if (Array.isArray(horaSlot)) return `${String(horaSlot[0]).padStart(2, '0')}:${String(horaSlot[1] ?? 0).padStart(2, '0')}`;
    if (horaSlot?.hour !== undefined) return `${String(horaSlot.hour).padStart(2, '0')}:${String(horaSlot.minute ?? 0).padStart(2, '0')}`;
    return '00:00';
};

export const obtenerClientesFrecuentes = async (): Promise<ClienteFrecuente[]> => {
    try {
        const response = await api.get('/metricas/clientes-frecuentes');
        const data = response.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

export const obtenerSlotsOcupacion = async (fechaInicio?: string, fechaFin?: string): Promise<SlotOcupacion[]> => {
    try {
        const params: Record<string, string> = {};
        if (fechaInicio) params.fechaInicio = fechaInicio;
        if (fechaFin) params.fechaFin = fechaFin;
        const response = await api.get('/metricas/ocupacion', { params });
        const slots: any[] = response.data?.reporteOcupacion ?? [];
        return slots.map(s => ({
            diaSemana: s.diaSemana as string,
            horaSlot: parseHoraSlot(s.horaSlot),
            totalReservasEnSlot: Number(s.totalReservasEnSlot ?? 0),
            porcentajeOcupacion: Number(s.porcentajeOcupacion ?? 0),
        }));
    } catch {
        return [];
    }
};

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
