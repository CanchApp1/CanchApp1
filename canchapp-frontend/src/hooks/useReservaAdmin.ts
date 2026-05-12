// En src/hooks/useReservasAdmin.ts
import { useState, useEffect } from 'react';
import { obtenerReservasPorEstablecimiento } from '../services/reservaService';

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

    return { reservas, loading, refrescar: cargarReservas };
}