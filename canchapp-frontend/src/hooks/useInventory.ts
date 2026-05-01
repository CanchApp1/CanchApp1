import { useState, useEffect } from 'react';
import {
    obtenerCanchasPorEstablecimiento,
    crearCancha,
    actualizarCancha,
    eliminarCancha
} from '../services/canchaService';

// ============================================
// HOOK DE INVENTARIO — Lógica CRUD de Canchas
// "La Cocina" que prepara todo para la Vista
// ============================================

export const useInventory = (establecimientoId: number | null) => {
    const [canchas, setCanchas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Datos de auditoría (quién está haciendo la operación)
    const emailUsuario = sessionStorage.getItem('userEmail') || 'sistema';

    // ─── 1. OBTENER (READ) ───────────────────────────
    const fetchCanchas = async () => {
        if (!establecimientoId || establecimientoId === 0) return;

        setLoading(true);
        try {
            const data = await obtenerCanchasPorEstablecimiento(establecimientoId);

            // Filtramos: solo mostramos canchas con estado activo
            const activas = data.filter((cancha: any) =>
                cancha.estado === '1' || cancha.estado === true || cancha.estado === 1
            );

            setCanchas(activas);
        } catch (error) {
            console.error('Error en useInventory (fetch):', error);
        } finally {
            setLoading(false);
        }
    };

    // ─── 2. CREAR (CREATE) ───────────────────────────
    const addCancha = async (datos: { codigo: string; precioPorHora: number }) => {
        if (!establecimientoId) return;

        try {
            await crearCancha({
                codigo: datos.codigo,
                estado: '1',
                precioPorHora: datos.precioPorHora,
                establecimiento: { establecimientoId },
                usuarioCreacion: emailUsuario,
            });

            // Refrescamos la lista para que aparezca la nueva cancha
            await fetchCanchas();
            return true;
        } catch (error) {
            console.error('Error en useInventory (crear):', error);
            return false;
        }
    };

    // ─── 3. EDITAR (UPDATE) ──────────────────────────
    const updateCancha = async (canchaId: number, datos: { codigo: string; precioPorHora: number; estado: string }) => {
        if (!establecimientoId) return;

        try {
            await actualizarCancha(canchaId, {
                codigo: datos.codigo,
                estado: datos.estado,
                precioPorHora: datos.precioPorHora,
                establecimiento: { establecimientoId },
                usuarioModificacion: emailUsuario,
            });

            await fetchCanchas();
            return true;
        } catch (error) {
            console.error('Error en useInventory (actualizar):', error);
            return false;
        }
    };

    // ─── 4. ELIMINAR (DELETE) ────────────────────────
    const deleteCancha = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;

        try {
            await eliminarCancha(id);
            await fetchCanchas();
            return true;
        } catch (error) {
            console.error('Error en useInventory (eliminar):', error);
            return false;
        }
    };

    // ─── 5. EFECTO AUTOMÁTICO ────────────────────────
    useEffect(() => {
        fetchCanchas();
    }, [establecimientoId]);

    // ─── 6. RETORNO PÚBLICO ─────────────────────────
    return {
        canchas,
        loading,
        addCancha,
        updateCancha,
        deleteCancha,
        refresh: fetchCanchas,
    };
};
