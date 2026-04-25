import { useState, useEffect } from 'react';
import { obtenerHorasDisponibles } from '../services/reservaService';

export const useAvailability = (establecimientoId: number | undefined, canchaId: number | undefined) => {
    const today = new Date().toISOString().split('T')[0];
    const [fechaSeleccionada, setFechaSeleccionada] = useState(today);
    const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

    useEffect(() => {
        if (establecimientoId && canchaId && fechaSeleccionada) {
            const cargar = async () => {
                setBuscando(true);
                try {
                    const horas = await obtenerHorasDisponibles(establecimientoId, fechaSeleccionada, canchaId);
                    setHorasDisponibles(horas);
                } catch (error) {
                    console.error("Error cargando horas:", error);
                    setHorasDisponibles([]);
                } finally {
                    setBuscando(false);
                }
            };
            cargar();
        }
    }, [establecimientoId, canchaId, fechaSeleccionada]);

    return {
        fechaSeleccionada,
        setFechaSeleccionada,
        horasDisponibles,
        buscando,
        horaSeleccionada,
        setHoraSeleccionada
    };
};
