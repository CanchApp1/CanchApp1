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
                const todos = respuesta.objectResponse || [];

                console.log(`[useCanchas] Total establecimientos recibidos: ${todos.length}`,
                    todos.map((e: any) => ({ id: e.establecimientoId, nombre: e.nombreEstablecimiento, estado: e.estado }))
                );

                const esActivo = (estado: any) =>
                    estado === true || estado === 1 || estado === '1' || estado === 'ACTIVA' || estado === 'ACTIVO';

                const activas = todos.filter((c: any) => esActivo(c.estado));

                console.log(`[useCanchas] Establecimientos activos tras filtro: ${activas.length}`);

                const detalladas = await Promise.all(
                    activas.map(async (est: any) => {
                        const id = est.establecimientoId;
                        const [resCanchas, resHorarios] = await Promise.all([
                            obtenerCanchasPorEstablecimiento(id),
                            obtenerHorariosPorEstablecimiento(id)
                        ]);

                        const canchasActivas = (resCanchas || []).filter((c: any) => esActivo(c.estado));

                        console.log(`[useCanchas] Est. "${est.nombreEstablecimiento}": ${(resCanchas||[]).length} canchas totales, ${canchasActivas.length} activas`);

                        return { ...est, canchas: canchasActivas, horarios: resHorarios || [] };
                    })
                );

                const finales = detalladas.filter(est => est.canchas.length > 0);

                console.log(`[useCanchas] Establecimientos visibles al jugador: ${finales.length}`);

                setCanchas(finales);
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
