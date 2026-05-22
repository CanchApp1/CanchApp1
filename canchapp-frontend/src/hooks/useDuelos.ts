import { useState, useEffect, useCallback } from 'react';
import { listarDuelosDisponibles, type DueloDTO } from '../services/dueloService';
import { obtenerEstablecimientos } from '../services/establecimientoService';
import { obtenerCanchasPorEstablecimiento } from '../services/canchaService';

export interface CanchaInfo {
  canchaId: number;
  codigo: string;
  precioPorHora: number;
  establecimientoId: number;
  nombreEstablecimiento: string;
  direccion: string;
}

export function useDuelos() {
  const [duelos, setDuelos] = useState<DueloDTO[]>([]);
  const [canchas, setCanchas] = useState<CanchaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Cargamos duelos y canchas de forma independiente para que si una falla no bloquee la otra
    const [resultDuelos, resultEst] = await Promise.allSettled([
      listarDuelosDisponibles(),
      obtenerEstablecimientos(),
    ]);

    if (resultDuelos.status === 'fulfilled') {
      setDuelos(resultDuelos.value);
    } else {
      setError('No se pudieron cargar los duelos. Intenta de nuevo.');
    }

    if (resultEst.status === 'fulfilled') {
      const esActivo = (estado: any) =>
        estado === true || estado === 1 || estado === '1' || estado === 'ACTIVA' || estado === 'ACTIVO';

      const ests: any[] = (resultEst.value.objectResponse ?? resultEst.value ?? [])
        .filter((e: any) => esActivo(e.estado));

      const canchasPorEst = await Promise.all(
        ests.map(async (est: any) => {
          try {
            const resCanchas = await obtenerCanchasPorEstablecimiento(est.establecimientoId);
            return (resCanchas ?? [])
              .filter((c: any) => esActivo(c.estado))
              .map((c: any) => ({
                canchaId: c.canchaId,
                codigo: c.codigo,
                precioPorHora: c.precioPorHora,
                establecimientoId: est.establecimientoId,
                nombreEstablecimiento: est.nombreEstablecimiento,
                direccion: est.direccion,
              }));
          } catch {
            return [];
          }
        })
      );
      setCanchas(canchasPorEst.flat());
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const getCanchaInfo = (canchaId: number): CanchaInfo | undefined =>
    canchas.find(c => c.canchaId === canchaId);

  return { duelos, canchas, loading, error, refetch: cargarDatos, getCanchaInfo };
}
