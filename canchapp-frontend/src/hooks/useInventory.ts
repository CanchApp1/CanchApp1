import { useState, useEffect } from 'react';
import { obtenerCanchasPorEstablecimiento, eliminarCancha } from '../services/canchaService';

export const useInventory = (establecimientoId: number | null) => {
    const [canchas, setCanchas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. OBTENER (READ)
    const fetchCanchas = async () => {
        if (!establecimientoId || establecimientoId === 0) return;

        setLoading(true);
        try {
            const data = await obtenerCanchasPorEstablecimiento(establecimientoId);
            setCanchas(data);
        } catch (error) {
            console.error("Error en useInventory:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. ELIMINAR (DELETE)
    const deleteCancha = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta cancha?")) return;

        try {
            await eliminarCancha(id);
            alert("¡Cancha eliminada con éxito!");
            await fetchCanchas();
        } catch (error) {
            console.error("Error al borrar:", error);
            alert("No se pudo eliminar la cancha. Verifica si tiene reservas activas.");
        }
    };

    // 3. Efecto automático para cargar al inicio
    useEffect(() => {
        fetchCanchas();
    }, [establecimientoId]);

    // 4. Devolvemos los datos y las funciones
    return {
        canchas,
        loading,
        deleteCancha,
        refresh: fetchCanchas
    };
};
