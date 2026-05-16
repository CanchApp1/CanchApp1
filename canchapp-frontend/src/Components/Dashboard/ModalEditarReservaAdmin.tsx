import { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import { obtenerHorasDisponibles, obtenerHorasDisponiblesFin } from '../../services/reservaService';

interface ReservaEditData {
    canchaId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    descripcion: string;
}

interface Props {
    visible: boolean;
    reserva: any | null;
    establecimientoId: number;
    onGuardar: (id: number, data: ReservaEditData) => Promise<void>;
    onCerrar: () => void;
}

export default function ModalEditarReservaAdmin({ visible, reserva, establecimientoId, onGuardar, onCerrar }: Props) {
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const [horasInicio, setHorasInicio] = useState<string[]>([]);
    const [horasFin, setHorasFin] = useState<string[]>([]);
    const [loadingInicio, setLoadingInicio] = useState(false);
    const [loadingFin, setLoadingFin] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    // Pre-llenar con datos actuales cuando se abre el modal
    useEffect(() => {
        if (visible && reserva) {
            setFecha(reserva.fecha ?? '');
            setHoraInicio(reserva.horaInicio ?? '');
            setHoraFin(reserva.horaFin ?? '');
            setDescripcion(reserva.descripcion ?? '');
            setHorasInicio([]);
            setHorasFin([]);
            setError('');
        }
    }, [visible, reserva]);

    // Recargar horas de inicio cuando cambia fecha
    useEffect(() => {
        if (!reserva?.cancha?.canchaId || !fecha) return;
        setLoadingInicio(true);
        setHoraInicio('');
        setHoraFin('');
        setHorasFin([]);
        obtenerHorasDisponibles(establecimientoId, fecha, reserva.cancha.canchaId)
            .then((horas) => {
                // Incluir la hora actual aunque no esté en la lista de disponibles
                const horaActual = reserva.horaInicio;
                const lista = horas.includes(horaActual) ? horas : [horaActual, ...horas];
                setHorasInicio(lista);
                setHoraInicio(horaActual);
            })
            .finally(() => setLoadingInicio(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]);

    // Recargar horas de fin cuando cambia hora inicio
    useEffect(() => {
        if (!reserva?.cancha?.canchaId || !fecha || !horaInicio) return;
        setLoadingFin(true);
        setHoraFin('');
        obtenerHorasDisponiblesFin(reserva.cancha.canchaId, fecha, horaInicio)
            .then((horas) => {
                // Incluir la hora fin actual si la hora de inicio no cambió
                const horaFinActual = reserva.horaFin;
                const mismaHoraInicio = horaInicio === reserva.horaInicio;
                const lista = (mismaHoraInicio && !horas.includes(horaFinActual))
                    ? [horaFinActual, ...horas]
                    : horas;
                setHorasFin(lista);
                setHoraFin(mismaHoraInicio ? horaFinActual : '');
            })
            .finally(() => setLoadingFin(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [horaInicio, fecha]);

    const handleGuardar = async () => {
        if (!fecha || !horaInicio || !horaFin) {
            setError('Completa todos los campos obligatorios.');
            return;
        }
        setError('');
        setGuardando(true);
        try {
            await onGuardar(reserva.reservaId, { canchaId: reserva.cancha.canchaId, fecha, horaInicio, horaFin, descripcion });
            onCerrar();
        } catch {
            setError('No se pudo guardar los cambios. Verifica los datos e intenta de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

    if (!visible || !reserva) return null;

    const hoy = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md p-8 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#03292e]">Editar reserva</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Cancha: <span className="font-bold text-[#03292e]">{reserva.cancha?.codigo}</span>
                        </p>
                    </div>
                    <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-2xl font-medium">
                        {error}
                    </div>
                )}

                {/* Fecha */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} /> Fecha
                    </label>
                    <input
                        type="date"
                        value={fecha}
                        min={hoy}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all"
                    />
                </div>

                {/* Hora inicio */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} /> Hora inicio
                    </label>
                    {loadingInicio ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm text-gray-400">
                            <div className="animate-spin h-4 w-4 border-b-2 border-[#0ed1e8] rounded-full" />
                            Cargando horarios...
                        </div>
                    ) : (
                        <select
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all"
                        >
                            <option value="" disabled>Selecciona hora</option>
                            {horasInicio.length > 0
                                ? horasInicio.map((h) => (
                                    <option key={h} value={h}>{h.slice(0, 5)}</option>
                                ))
                                : horaInicio && (
                                    <option value={horaInicio}>{horaInicio.slice(0, 5)}</option>
                                )
                            }
                        </select>
                    )}
                </div>

                {/* Hora fin */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} /> Hora fin
                    </label>
                    {loadingFin ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm text-gray-400">
                            <div className="animate-spin h-4 w-4 border-b-2 border-[#0ed1e8] rounded-full" />
                            Cargando horarios...
                        </div>
                    ) : (
                        <select
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                            disabled={!horaInicio}
                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all disabled:opacity-50"
                        >
                            <option value="" disabled>
                                {!horaInicio ? 'Selecciona hora inicio primero' : 'Selecciona hora'}
                            </option>
                            {horasFin.length > 0
                                ? horasFin.map((h) => (
                                    <option key={h} value={h}>{h.slice(0, 5)}</option>
                                ))
                                : horaFin && (
                                    <option value={horaFin}>{horaFin.slice(0, 5)}</option>
                                )
                            }
                        </select>
                    )}
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={13} /> Descripción <span className="text-gray-300 normal-case font-normal">(opcional)</span>
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Ej: Reserva para Juan Pérez - reserva telefónica"
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#0ed1e8] transition-all resize-none"
                    />
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onCerrar}
                        className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="flex-1 py-3 rounded-2xl bg-[#03292e] text-white text-sm font-bold hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all disabled:opacity-60"
                    >
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
