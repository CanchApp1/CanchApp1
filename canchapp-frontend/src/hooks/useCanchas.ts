import { useState, useEffect } from 'react';
import { obtenerEstablecimientos } from '../services/establecimientoService';
import { obtenerCanchasPorEstablecimiento } from '../services/canchaService';
import { obtenerHorariosPorEstablecimiento } from '../services/horarioService';

export const useCanchas = () => {
    const [canchas, setCanchas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const cargarDatos = async () => {
        setLoading(true);
        setError(false);
        try {
            const respuesta = await obtenerEstablecimientos();
            const todos = respuesta.objectResponse || [];

            const esActivo = (estado: any) =>
                estado === true || estado === 1 || estado === '1' || estado === 'ACTIVA' || estado === 'ACTIVO';

            const activas = todos.filter((c: any) => esActivo(c.estado));

            const detalladas = await Promise.all(
                activas.map(async (est: any) => {
                    const id = est.establecimientoId;
                    const [resCanchas, resHorarios] = await Promise.all([
                        obtenerCanchasPorEstablecimiento(id),
                        obtenerHorariosPorEstablecimiento(id)
                    ]);
                    const canchasActivas = (resCanchas || []).filter((c: any) => esActivo(c.estado));
                    return { ...est, canchas: canchasActivas, horarios: resHorarios || [] };
                })
            );

            setCanchas(detalladas.filter(est => est.canchas.length > 0));
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    return { canchas, loading, error, refrescar: cargarDatos };
};
