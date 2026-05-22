import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
    obtenerReservasPorEstablecimiento,
    cancelarReserva as cancelarReservaService,
    crearReservaAdmin as crearReservaAdminService,
} from '../services/reservaService';

export function useReservasAdmin(establecimientoId: number | null) {
    const { toast } = useToast();
    const [reservas, setReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (establecimientoId) {
            cargarReservas();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [establecimientoId]);

    const cargarReservas = async () => {
        setLoading(true);
        try {
            const data = await obtenerReservasPorEstablecimiento(establecimientoId!);
            setReservas(data);
        } catch {
            toast('No se pudieron cargar las reservas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cancelarReserva = async (id: number) => {
        try {
            await cancelarReservaService(id);
            await cargarReservas();
            toast('Reserva cancelada correctamente.', 'success');
        } catch (error) {
            toast('No se pudo cancelar la reserva. Intenta de nuevo.', 'error');
            throw error;
        }
    };

    const crearReserva = async (data: Parameters<typeof crearReservaAdminService>[0]) => {
        try {
            await crearReservaAdminService(data);
            await cargarReservas();
            toast('Reserva creada exitosamente.', 'success');
        } catch (error) {
            toast('No se pudo crear la reserva. Verifica los datos.', 'error');
            throw error;
        }
    };

    const editarReserva = async (id: number, data: Parameters<typeof crearReservaAdminService>[0]) => {
        try {
            await cancelarReservaService(id);
            await crearReservaAdminService(data);
            await cargarReservas();
            toast('Reserva modificada exitosamente.', 'success');
        } catch (error) {
            toast('No se pudo modificar la reserva. Verifica los datos.', 'error');
            throw error;
        }
    };

    return { reservas, loading, refrescar: cargarReservas, cancelarReserva, crearReserva, editarReserva };
}
