import { useState } from 'react';
import { X, Calendar, Clock, User, Hash, FileText, Pencil, XCircle } from 'lucide-react';
import { getEstadoDisplay, puedeModificar } from '../../utils/reservaUtils';

interface Props {
    visible: boolean;
    reserva: any | null;
    esDeAdmin: boolean;
    onCerrar: () => void;
    onEditar: () => void;
    onCancelar: (id: number) => Promise<void>;
}

export default function ModalDetalleReserva({ visible, reserva, esDeAdmin, onCerrar, onEditar, onCancelar }: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const [cancelando, setCancelando] = useState(false);

    if (!visible || !reserva) return null;

    const id = reserva.reservaId ?? reserva.idReserva;
    const estado = getEstadoDisplay(reserva.estadoReserva, reserva.fecha);
    const modificable = puedeModificar(reserva.estadoReserva, reserva.fecha);
    const puedeActuar = esDeAdmin && modificable;

    const razonDeshabilitado = () => {
        if (!esDeAdmin) return 'Solo puedes gestionar las reservas que creaste.';
        if (reserva.estadoReserva === 'CANCELADA') return 'Esta reserva ya fue cancelada.';
        if (!modificable) return 'No se pueden modificar reservas pasadas.';
        return '';
    };

    const handleCancelar = async () => {
        setCancelando(true);
        try {
            await onCancelar(id);
            onCerrar();
        } finally {
            setCancelando(false);
            setConfirmando(false);
        }
    };

    const handleClose = () => {
        setConfirmando(false);
        onCerrar();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-md p-8 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#03292e]">Detalle de reserva</h2>
                        <span className={`mt-1 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${estado.colorLight}`}>
                            {estado.label}
                        </span>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                        <User size={16} className="text-[#0ed1e8] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</p>
                            <p className="text-sm font-bold text-[#03292e]">{reserva.usuario?.nombre || 'Cliente Anónimo'}</p>
                            {reserva.usuario?.correo && (
                                <p className="text-xs text-gray-400">{reserva.usuario.correo}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                        <Hash size={16} className="text-[#0ed1e8] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancha</p>
                            <p className="text-sm font-bold text-[#03292e]">{reserva.cancha?.codigo ?? '—'}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                            <Calendar size={16} className="text-[#0ed1e8] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</p>
                                <p className="text-sm font-bold text-[#03292e]">{reserva.fecha}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                            <Clock size={16} className="text-[#0ed1e8] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Horario</p>
                                <p className="text-sm font-bold text-[#03292e]">
                                    {reserva.horaInicio?.slice(0, 5)} — {reserva.horaFin?.slice(0, 5)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {reserva.descripcion && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                            <FileText size={16} className="text-[#0ed1e8] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</p>
                                <p className="text-sm text-gray-600 font-medium">{reserva.descripcion}</p>
                            </div>
                        </div>
                    )}

                    {!puedeActuar && (
                        <p className="text-[11px] text-gray-400 font-bold text-center bg-amber-50 text-amber-600 rounded-2xl px-4 py-3">
                            {razonDeshabilitado()}
                        </p>
                    )}
                </div>

                {/* Acciones */}
                {confirmando ? (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-bold text-center text-gray-600">¿Confirmas la cancelación de esta reserva?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmando(false)}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-all"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCancelar}
                                disabled={cancelando}
                                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-60"
                            >
                                {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 text-sm font-bold hover:bg-gray-200 transition-all"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={onEditar}
                            disabled={!puedeActuar}
                            title={!puedeActuar ? razonDeshabilitado() : ''}
                            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl bg-blue-50 text-blue-500 text-sm font-bold hover:bg-blue-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Pencil size={15} /> Editar
                        </button>
                        <button
                            onClick={() => setConfirmando(true)}
                            disabled={!puedeActuar}
                            title={!puedeActuar ? razonDeshabilitado() : ''}
                            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <XCircle size={15} /> Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
