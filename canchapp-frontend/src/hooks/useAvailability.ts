import { useState, useEffect } from 'react';
import { obtenerHorasDisponibles } from '../services/reservaService';
import { fechaLocal } from '../utils/fecha';

export const useAvailability = (establecimientoId: number | undefined, canchaIds: number[]) => {
    const today = fechaLocal();
    const [fechaSeleccionada, setFechaSeleccionada] = useState(today);
    const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

    // Stable key so the effect only re-fires when the actual IDs change
    const canchaIdsKey = canchaIds.join(',');

    useEffect(() => {
        if (!establecimientoId || !canchaIdsKey || !fechaSeleccionada) return;

        const ids = canchaIdsKey.split(',').map(Number);

        const cargar = async () => {
            setBuscando(true);
            try {
                // Query all courts in parallel and take the UNION of available slots.
                // A slot is shown as available if at least one court in the establishment is free.
                const results = await Promise.all(
                    ids.map(id => obtenerHorasDisponibles(establecimientoId, fechaSeleccionada, id))
                );
                const union = [...new Set(results.flat())].sort();
                setHorasDisponibles(union);
            } catch {
                setHorasDisponibles([]);
            } finally {
                setBuscando(false);
            }
        };

        cargar();
    }, [establecimientoId, fechaSeleccionada, canchaIdsKey]);

    return {
        fechaSeleccionada,
        setFechaSeleccionada,
        horasDisponibles,
        buscando,
        horaSeleccionada,
        setHoraSeleccionada
    };
};
