import { useState, useEffect } from 'react';
import {
    obtenerReservasPorEstablecimiento,
    cancelarReserva as cancelarReservaService,
    crearReservaAdmin as crearReservaAdminService,
} from '../services/reservaService';

export function useReservasAdmin(establecimientoId: number | null) {
    const [reservas, setReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (establecimientoId) {
            cargarReservas();
        }
    }, [establecimientoId]);

    const cargarReservas = async () => {
        setLoading(true);
        const data = await obtenerReservasPorEstablecimiento(establecimientoId!);
        setReservas(data);
        setLoading(false);
    };

    const cancelarReserva = async (id: number) => {
        await cancelarReservaService(id);
        await cargarReservas();
    };

    const crearReserva = async (data: Parameters<typeof crearReservaAdminService>[0]) => {
        await crearReservaAdminService(data);
        await cargarReservas();
    };

    return { reservas, loading, refrescar: cargarReservas, cancelarReserva, crearReserva };
}