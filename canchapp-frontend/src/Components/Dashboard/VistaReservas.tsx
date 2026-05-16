import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Clock, X, Plus, Pencil } from 'lucide-react';
import ModalCrearReservaAdmin from './ModalCrearReservaAdmin';
import ModalEditarReservaAdmin from './ModalEditarReservaAdmin';

interface Props {
    reservas: any[];
    loading: boolean;
    adminUserId: number;
    canchas: any[];
    establecimientoId: number;
    onCancelar: (id: number) => Promise<void>;
    onCrear: (data: { canchaId: number; fecha: string; horaInicio: string; horaFin: string; descripcion: string }) => Promise<void>;
    onEditar: (id: number, data: { canchaId: number; fecha: string; horaInicio: string; horaFin: string; descripcion: string }) => Promise<void>;
}

const COLORES_ESTADO: Record<string, string> = {
    CONFIRMADA: 'bg-green-100 text-green-600',
    PENDIENTE_PAGO: 'bg-orange-100 text-orange-600',
    CANCELADA: 'bg-red-100 text-red-500',
};

const FILTROS_ESTADO = [
    { key: 'todas', label: 'Todos' },
    { key: 'CONFIRMADA', label: 'Confirmadas' },
    { key: 'PENDIENTE_PAGO', label: 'Pendiente pago' },
    { key: 'CANCELADA', label: 'Canceladas' },
];

export default function VistaReservasEstablecimiento({ reservas, loading, adminUserId, canchas, establecimientoId, onCancelar, onCrear, onEditar }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [filtroTiempo, setFiltroTiempo] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
    const [cancelando, setCancelando] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [reservaEditando, setReservaEditando] = useState<any | null>(null);

    const reservasFiltradas = useMemo(() => {
        return reservas.filter(res => {
            const matchBusqueda =
                res.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                res.cancha?.codigo?.toLowerCase().includes(busqueda.toLowerCase());

            const fechaReserva = new Date(res.fecha);
            const hoy = new Date();
            let matchTiempo = true;

            if (filtroTiempo === 'hoy') {
                matchTiempo = fechaReserva.toDateString() === hoy.toDateString();
            } else if (filtroTiempo === 'semana') {
                const haceUnaSemana = new Date();
                haceUnaSemana.setDate(hoy.getDate() - 7);
                matchTiempo = fechaReserva >= haceUnaSemana;
            } else if (filtroTiempo === 'mes') {
                matchTiempo =
                    fechaReserva.getMonth() === hoy.getMonth() &&
                    fechaReserva.getFullYear() === hoy.getFullYear();
            }

            const matchEstado = filtroEstado === 'todas' || res.estadoReserva === filtroEstado;

            return matchBusqueda && matchTiempo && matchEstado;
        });
    }, [reservas, busqueda, filtroTiempo, filtroEstado]);

    const handleCancelar = async (id: number) => {
        setCancelando(id);
        try {
            await onCancelar(id);
        } finally {
            setCancelando(null);
            setConfirmandoId(null);
        }
    };

    const esDeAdmin = (res: any) => res.usuario?.usuarioId === adminUserId;
    const puedeCancel = (res: any) => esDeAdmin(res) && res.estadoReserva !== 'CANCELADA';
    const puedeEditar = (res: any) => esDeAdmin(res) && res.estadoReserva !== 'CANCELADA';

    return (
        <div className="space-y-6">
            <ModalCrearReservaAdmin
                visible={modalVisible}
                canchas={canchas}
                establecimientoId={establecimientoId}
                onGuardar={onCrear}
                onCerrar={() => setModalVisible(false)}
            />
            <ModalEditarReservaAdmin
                visible={reservaEditando !== null}
                reserva={reservaEditando}
                establecimientoId={establecimientoId}
                onGuardar={onEditar}
                onCerrar={() => setReservaEditando(null)}
            />

            {/* Barra de filtros */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por cliente o cancha..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0ed1e8] transition-all text-sm"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setModalVisible(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-[#03292e] text-white text-sm font-bold rounded-2xl hover:bg-[#0ed1e8] hover:text-[#03292e] transition-all flex-shrink-0"
                        >
                            <Plus size={16} />
                            Nueva reserva
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        {['todas', 'hoy', 'semana', 'mes'].map((tipo) => (
                            <button
                                key={tipo}
                                onClick={() => setFiltroTiempo(tipo)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                                    filtroTiempo === tipo
                                        ? 'bg-[#03292e] text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtro por estado */}
                <div className="flex gap-2 flex-wrap">
                    {FILTROS_ESTADO.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFiltroEstado(key)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                filtroEstado === key
                                    ? 'bg-[#0ed1e8] text-[#03292e]'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de reservas */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reservasFiltradas.length > 0 ? (
                        reservasFiltradas.map((res: any, index: number) => {
                            const id = res.reservaId ?? res.idReserva;
                            const enConfirmacion = confirmandoId === id;

                            return (
                                <div
                                    key={id ?? index}
                                    className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-[#e6effc] rounded-2xl flex items-center justify-center text-[#03292e]">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#03292e]">
                                                {res.usuario?.nombre || 'Cliente Anónimo'}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                                {res.cancha?.codigo} • {res.fecha}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-[#0ed1e8]" />
                                            <span className="text-sm font-bold text-gray-600">
                                                {res.horaInicio} - {res.horaFin}
                                            </span>
                                        </div>

                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${COLORES_ESTADO[res.estadoReserva] ?? 'bg-gray-100 text-gray-500'}`}>
                                            {res.estadoReserva}
                                        </span>

                                        {puedeEditar(res) && !enConfirmacion && (
                                            <button
                                                onClick={() => setReservaEditando(res)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all"
                                            >
                                                <Pencil size={13} />
                                                Editar
                                            </button>
                                        )}

                                        {puedeCancel(res) && (
                                            enConfirmacion ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCancelar(id)}
                                                        disabled={cancelando === id}
                                                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-60"
                                                    >
                                                        {cancelando === id ? 'Cancelando...' : 'Confirmar'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmandoId(null)}
                                                        className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
                                                    >
                                                        Volver
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmandoId(id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-all"
                                                >
                                                    <X size={13} />
                                                    Cancelar reserva
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No se encontraron reservas con esos filtros.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
