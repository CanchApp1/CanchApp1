import { useState } from 'react';
import { Clock, Plus, Pencil, Trash2, AlertCircle, X, Save, CalendarDays } from 'lucide-react';
import { DIAS_ESPANOL } from '../../hooks/useHorarios';

// ============================================
// VISTA DE HORARIOS — Gestión semanal
// Tabla visual con acciones por día
// ============================================

interface Props {
    horarios: any[];
    loading: boolean;
    diasSinHorario: string[];
    onCrear: (datos: { diaSemana: string; horaApertura: string; horaCierre: string }) => Promise<boolean>;
    onEditar: (id: number, datos: { diaSemana: string; horaApertura: string; horaCierre: string }) => Promise<boolean>;
    onEliminar: (id: number) => Promise<boolean>;
}

export default function VistaHorarios({ horarios, loading, diasSinHorario, onCrear, onEditar, onEliminar }: Props) {
    // Estado para el formulario inline
    const [editando, setEditando] = useState<number | null>(null);
    const [creando, setCreando] = useState(false);
    const [formData, setFormData] = useState({ diaSemana: '', horaApertura: '', horaCierre: '' });
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Abrir formulario de CREAR
    const iniciarCrear = () => {
        setEditando(null);
        setCreando(true);
        setFormData({
            diaSemana: diasSinHorario[0] || '',
            horaApertura: '08:00',
            horaCierre: '22:00',
        });
        setError('');
    };

    // Abrir formulario de EDITAR
    const iniciarEditar = (horario: any) => {
        setCreando(false);
        setEditando(horario.horarioId);
        setFormData({
            diaSemana: horario.diaSemana,
            horaApertura: horario.horaApertura?.slice(0, 5) || '08:00',
            horaCierre: horario.horaCierre?.slice(0, 5) || '22:00',
        });
        setError('');
    };

    // Cancelar
    const cancelar = () => {
        setEditando(null);
        setCreando(false);
        setError('');
    };

    // Guardar (crear o editar)
    const guardar = async () => {
        if (!formData.diaSemana) {
            setError('Selecciona un día.');
            return;
        }
        if (formData.horaApertura >= formData.horaCierre) {
            setError('La hora de cierre debe ser posterior a la de apertura.');
            return;
        }

        if (!window.confirm(`¿Estás seguro de que deseas guardar este horario para el ${DIAS_ESPANOL[formData.diaSemana]}?`)) {
            return;
        }

        setGuardando(true);
        setError('');

        try {
            let exito = false;
            if (creando) {
                exito = await onCrear(formData);
            } else if (editando) {
                exito = await onEditar(editando, formData);
            }

            if (exito) {
                cancelar();
            } else {
                setError('Error al guardar el horario.');
            }
        } catch {
            setError('Error de conexión.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-right-4 duration-500">
            {/* Cabecera */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black text-[#03292e] mb-2">Horarios</h2>
                    <p className="text-gray-500">
                        Define el horario de atención de tu establecimiento.
                    </p>
                </div>
                {diasSinHorario.length > 0 && !creando && (
                    <button
                        onClick={iniciarCrear}
                        className="flex items-center gap-2 bg-[#03292e] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#0a4149] transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={18} /> Agregar Día
                    </button>
                )}
            </div>

            {/* Estado de carga */}
            {loading ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-14 h-14 border-4 border-[#0ed1e8]/30 border-t-[#0ed1e8] rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Cargando horarios...</p>
                </div>
            ) : (
                <div className="space-y-4">

                    {/* Formulario de CREACIÓN (inline) */}
                    {creando && (
                        <div className="bg-[#0ed1e8]/5 border-2 border-[#0ed1e8]/30 rounded-3xl p-6" style={{ animation: 'slideUp 300ms ease-out' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Plus size={18} className="text-[#0ed1e8]" />
                                <h4 className="font-bold text-[#03292e]">Nuevo Horario</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Día</label>
                                    <select
                                        value={formData.diaSemana}
                                        onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value })}
                                        className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium text-[#03292e]"
                                    >
                                        {diasSinHorario.map((dia) => (
                                            <option key={dia} value={dia}>
                                                {DIAS_ESPANOL[dia]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Apertura</label>
                                    <input
                                        type="time"
                                        value={formData.horaApertura}
                                        onChange={(e) => setFormData({ ...formData, horaApertura: e.target.value })}
                                        className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium text-[#03292e]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Cierre</label>
                                    <input
                                        type="time"
                                        value={formData.horaCierre}
                                        onChange={(e) => setFormData({ ...formData, horaCierre: e.target.value })}
                                        className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium text-[#03292e]"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={guardar}
                                        disabled={guardando}
                                        className="flex-1 flex items-center justify-center gap-1 bg-[#03292e] text-white py-3 rounded-2xl font-bold hover:bg-[#0a4149] transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Save size={16} /> {guardando ? '...' : 'Guardar'}
                                    </button>
                                    <button
                                        onClick={cancelar}
                                        className="px-4 py-3 rounded-2xl text-gray-500 bg-white hover:bg-gray-100 transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium mt-3">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lista de horarios */}
                    {horarios.map((horario: any) => (
                        <div
                            key={horario.horarioId}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between gap-4"
                        >
                            {editando === horario.horarioId ? (
                                // Modo edición inline
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Día</label>
                                        <input
                                            type="text"
                                            value={DIAS_ESPANOL[formData.diaSemana] || formData.diaSemana}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-100 rounded-2xl font-medium text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Apertura</label>
                                        <input
                                            type="time"
                                            value={formData.horaApertura}
                                            onChange={(e) => setFormData({ ...formData, horaApertura: e.target.value })}
                                            className="w-full px-4 py-3 bg-[#f3f6fb] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium text-[#03292e]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Cierre</label>
                                        <input
                                            type="time"
                                            value={formData.horaCierre}
                                            onChange={(e) => setFormData({ ...formData, horaCierre: e.target.value })}
                                            className="w-full px-4 py-3 bg-[#f3f6fb] rounded-2xl border-2 border-transparent focus:border-[#0ed1e8] outline-none font-medium text-[#03292e]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={guardar}
                                            disabled={guardando}
                                            className="flex-1 flex items-center justify-center gap-1 bg-[#03292e] text-white py-3 rounded-2xl font-bold hover:bg-[#0a4149] transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <Save size={16} /> {guardando ? '...' : 'Guardar'}
                                        </button>
                                        <button
                                            onClick={cancelar}
                                            className="px-4 py-3 rounded-2xl text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {error && (
                                        <div className="col-span-full flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium">
                                            <AlertCircle size={14} /> {error}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Modo lectura
                                <>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="bg-[#0ed1e8]/10 p-3 rounded-2xl">
                                            <CalendarDays size={22} className="text-[#0ed1e8]" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#03292e] text-lg">
                                                {DIAS_ESPANOL[horario.diaSemana] || horario.diaSemana}
                                            </h4>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-0.5">
                                                <Clock size={14} />
                                                <span className="font-medium">
                                                    {horario.horaApertura?.slice(0, 5)} — {horario.horaCierre?.slice(0, 5)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => iniciarEditar(horario)}
                                            className="flex items-center gap-1.5 bg-[#e6effc] text-[#03292e] px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-[#d0e2f7] transition-all active:scale-95"
                                        >
                                            <Pencil size={14} /> Editar
                                        </button>
                                        <button
                                            onClick={() => onEliminar(horario.horarioId)}
                                            className="flex items-center gap-1.5 bg-red-50 text-red-500 px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
                                        >
                                            <Trash2 size={14} /> Quitar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Estado vacío */}
                    {horarios.length === 0 && !creando && (
                        <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-[3rem]">
                            <p className="text-5xl mb-4">🕐</p>
                            <p className="text-gray-400 font-bold text-lg">No tienes horarios definidos.</p>
                            <p className="text-gray-300 mt-1">Agrega los días y horas en los que atiendes.</p>
                        </div>
                    )}

                    {/* Indicador de días completos */}
                    {diasSinHorario.length === 0 && horarios.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                            <p className="text-emerald-700 font-bold text-sm">
                                ✅ ¡Todos los días de la semana tienen horario definido!
                            </p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
