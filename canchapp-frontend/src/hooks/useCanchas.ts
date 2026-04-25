// En: src/hooks/useCanchas.ts
import { useState, useEffect } from 'react';
import { obtenerEstablecimientos } from '../services/establecimientoService';
import { obtenerCanchasPorEstablecimiento } from '../services/canchaService';
import { obtenerHorariosPorEstablecimiento } from '../services/horarioService';

export const useCanchas = () => {
    const [canchas, setCanchas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const respuesta = await obtenerEstablecimientos();
                const activas = (respuesta.objectResponse || []).filter((c: any) => c.estado === true || c.estado === 1);

                const detalladas = await Promise.all(
                    activas.map(async (est: any) => {
                        const id = est.establecimientoId;
                        const [resCanchas, resHorarios] = await Promise.all([
                            obtenerCanchasPorEstablecimiento(id),
                            obtenerHorariosPorEstablecimiento(id)
                        ]);
                        return { ...est, canchas: resCanchas || [], horarios: resHorarios || [] };
                    })
                );
                setCanchas(detalladas);
            } catch (error) {
                console.error("Error cargando canchas:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    return { canchas, loading };
};
