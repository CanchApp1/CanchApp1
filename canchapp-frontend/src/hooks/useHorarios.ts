import { useState, useEffect } from 'react';
import {
    obtenerHorariosPorEstablecimiento,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
} from '../services/horarioService';

// ============================================
// HOOK DE HORARIOS — Lógica CRUD de Horarios
// "La Cocina" que prepara los horarios
// ============================================

// Orden visual de los días
const ORDEN_DIAS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// Mapeo de nombres en inglés a español
export const DIAS_ESPANOL: Record<string, string> = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
};

export const useHorarios = (establecimientoId: number | null) => {
    const [horarios, setHorarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const emailUsuario = sessionStorage.getItem('userEmail') || 'sistema';

    // ─── 1. OBTENER (READ) ───────────────────────────
    const fetchHorarios = async () => {
        if (!establecimientoId || establecimientoId === 0) return;

        setLoading(true);
        try {
            const data = await obtenerHorariosPorEstablecimiento(establecimientoId);

            // Ordenamos por día de la semana para la vista
            const ordenados = data.sort((a: any, b: any) =>
                ORDEN_DIAS.indexOf(a.diaSemana) - ORDEN_DIAS.indexOf(b.diaSemana)
            );

            setHorarios(ordenados);
        } catch (error) {
            console.error('Error en useHorarios (fetch):', error);
        } finally {
            setLoading(false);
        }
    };

    // ─── 2. CREAR (CREATE) ───────────────────────────
    const addHorario = async (datos: { diaSemana: string; horaApertura: string; horaCierre: string }) => {
        if (!establecimientoId) return false;

        try {
            await crearHorario({
                ...datos,
                establecimiento: { establecimientoId },
                usuarioCreacion: emailUsuario,
            });
            await fetchHorarios();
            return true;
        } catch (error) {
            console.error('Error en useHorarios (crear):', error);
            return false;
        }
    };

    // ─── 3. EDITAR (UPDATE) ──────────────────────────
    const updateHorario = async (horarioId: number, datos: { diaSemana: string; horaApertura: string; horaCierre: string }) => {
        if (!establecimientoId) return false;

        try {
            await actualizarHorario(horarioId, {
                ...datos,
                establecimiento: { establecimientoId },
                usuarioModificacion: emailUsuario,
            });
            await fetchHorarios();
            return true;
        } catch (error) {
            console.error('Error en useHorarios (actualizar):', error);
            return false;
        }
    };

    // ─── 4. ELIMINAR (DELETE) ────────────────────────
    const deleteHorario = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este horario?')) return false;

        try {
            await eliminarHorario(id);
            await fetchHorarios();
            return true;
        } catch (error) {
            console.error('Error en useHorarios (eliminar):', error);
            return false;
        }
    };

    // ─── 5. EFECTO AUTOMÁTICO ────────────────────────
    useEffect(() => {
        fetchHorarios();
    }, [establecimientoId]);

    // ─── 6. DATOS DERIVADOS ─────────────────────────
    // Días que ya tienen horario definido
    const diasConHorario = horarios.map((h: any) => h.diaSemana);
    const diasSinHorario = ORDEN_DIAS.filter((d) => !diasConHorario.includes(d));

    return {
        horarios,
        loading,
        diasSinHorario,
        addHorario,
        updateHorario,
        deleteHorario,
        refresh: fetchHorarios,
    };
};
