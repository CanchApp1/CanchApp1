import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
    obtenerReservasPorEstablecimiento,
    cancelarReserva as cancelarReservaService,
    crearReservaAdmin as crearReservaAdminService,
} from '../services/reservaService';
import { obtenerPagosPorEstablecimiento } from '../services/pagoService';

export function useReservasAdmin(establecimientoId: number | null) {
    const { toast } = useToast();
    const [reservas, setReservas] = useState<any[]>([]);
    const [pagos, setPagos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (establecimientoId) cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [establecimientoId]);

    const cargarTodo = async () => {
        setLoading(true);
        try {
            const [dataReservas, dataPagos] = await Promise.all([
                obtenerReservasPorEstablecimiento(establecimientoId!),
                obtenerPagosPorEstablecimiento(establecimientoId!),
            ]);
            setReservas(dataReservas);
            setPagos(dataPagos);
        } catch {
            toast('No se pudieron cargar las reservas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getPagoDeReserva = (reservaId: number) =>
        pagos.find((p) => p.reservaId === reservaId) ?? null;

    const cancelarReserva = async (id: number) => {
        try {
            await cancelarReservaService(id);
            await cargarTodo();
            toast('Reserva cancelada correctamente.', 'success');
        } catch (err) {
            toast('No se pudo cancelar la reserva. Intenta de nuevo.', 'error');
            throw err;
        }
    };

    const crearReserva = async (data: Parameters<typeof crearReservaAdminService>[0]) => {
        try {
            await crearReservaAdminService(data);
            await cargarTodo();
            toast('Reserva creada exitosamente.', 'success');
        } catch (err) {
            toast('No se pudo crear la reserva. Verifica los datos.', 'error');
            throw err;
        }
    };

    const editarReserva = async (id: number, data: Parameters<typeof crearReservaAdminService>[0]) => {
        try {
            await cancelarReservaService(id);
            await crearReservaAdminService(data);
            await cargarTodo();
            toast('Reserva modificada exitosamente.', 'success');
        } catch (err) {
            toast('No se pudo modificar la reserva. Verifica los datos.', 'error');
            throw err;
        }
    };

    return { reservas, pagos, loading, refrescar: cargarTodo, getPagoDeReserva, cancelarReserva, crearReserva, editarReserva };
}
