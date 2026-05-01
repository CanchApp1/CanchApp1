import { useState, useEffect } from 'react';
import { obtenerMiEstablecimiento } from '../services/establecimientoService';

// ============================================
// HOOK DE ESTABLECIMIENTO — Datos del local
// "La Cocina" de la configuración del perfil
// ============================================

export const useEstablecimiento = (userId: number) => {
    const [establecimiento, setEstablecimiento] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchEstablecimiento = async () => {
        if (!userId || userId === 0) return;

        setLoading(true);
        try {
            const data = await obtenerMiEstablecimiento(userId);
            setEstablecimiento(data);
        } catch (error) {
            console.error('Error en useEstablecimiento:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstablecimiento();
    }, [userId]);

    return {
        establecimiento,
        loading,
        refresh: fetchEstablecimiento,
    };
};
