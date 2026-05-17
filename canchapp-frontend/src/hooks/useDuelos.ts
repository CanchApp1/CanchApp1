import { useState, useEffect, useCallback } from 'react';
import { listarDuelosDisponibles, type DueloDTO } from '../services/dueloService';
import { obtenerEstablecimientos } from '../services/establecimientoService';

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
    try {
      const [duelosData, estData] = await Promise.all([
        listarDuelosDisponibles(),
        obtenerEstablecimientos(),
      ]);

      setDuelos(duelosData);

      const lista: CanchaInfo[] = [];
      const ests: any[] = estData.objectResponse ?? estData ?? [];
      for (const est of ests) {
        for (const cancha of (est.canchas ?? [])) {
          lista.push({
            canchaId: cancha.canchaId,
            codigo: cancha.codigo,
            precioPorHora: cancha.precioPorHora,
            establecimientoId: est.establecimientoId,
            nombreEstablecimiento: est.nombreEstablecimiento,
            direccion: est.direccion,
          });
        }
      }
      setCanchas(lista);
    } catch {
      setError('No se pudieron cargar los duelos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const getCanchaInfo = (canchaId: number): CanchaInfo | undefined =>
    canchas.find(c => c.canchaId === canchaId);

  return { duelos, canchas, loading, error, refetch: cargarDatos, getCanchaInfo };
}
