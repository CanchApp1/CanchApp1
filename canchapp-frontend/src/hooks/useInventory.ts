import { useState, useEffect } from 'react';
import {
    obtenerCanchasPorEstablecimiento,
    crearCancha,
    actualizarCancha,
    eliminarCancha
} from '../services/canchaService';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

// ============================================
// HOOK DE INVENTARIO — Lógica CRUD de Canchas
// "La Cocina" que prepara todo para la Vista
// ============================================

export const useInventory = (establecimientoId: number | null) => {
    const [canchas, setCanchas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { confirm } = useConfirm();

    const emailUsuario = sessionStorage.getItem('userEmail') || 'sistema';

    // ─── 1. OBTENER (READ) ───────────────────────────
    const fetchCanchas = async () => {
        if (!establecimientoId || establecimientoId === 0) return;

        setLoading(true);
        try {
            const data = await obtenerCanchasPorEstablecimiento(establecimientoId);
            setCanchas(data);
        } catch {
            toast('Error al cargar las canchas.', 'error');
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
            await fetchCanchas();
            toast('Cancha creada exitosamente.', 'success');
            return true;
        } catch {
            toast('Error al crear la cancha. Es posible que el código ya exista.', 'error');
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
            toast('Cancha actualizada correctamente.', 'success');
            return true;
        } catch {
            toast('Error al actualizar la cancha. Intenta de nuevo.', 'error');
            return false;
        }
    };

    // ─── 4. ELIMINAR (DELETE) ────────────────────────
    const deleteCancha = async (id: number) => {
        if (canchas.length <= 1) {
            toast('No puedes eliminar la única cancha de tu establecimiento. Debes tener al menos una activa.', 'warning');
            return;
        }

        if (!await confirm('¿Estás seguro de que quieres eliminar esta cancha?', 'Eliminar', 'Cancelar')) return;

        try {
            await eliminarCancha(id);
            await fetchCanchas();
            toast('Cancha eliminada.', 'success');
            return true;
        } catch {
            toast('Error al eliminar la cancha. Intenta de nuevo.', 'error');
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
