import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Clock, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SkeletonReservaItem } from './SkeletonCard';
import ModalCrearReservaAdmin from './ModalCrearReservaAdmin';
import ModalEditarReservaAdmin from './ModalEditarReservaAdmin';
import ModalDetalleReserva from './ModalDetalleReserva';
import { getEstadoDisplay, puedeModificar } from '../../utils/reservaUtils';

type OrdenKey = 'fecha' | 'cliente' | 'cancha' | 'estado';

interface Props {
    reservas: any[];
    pagos: any[];
    loading: boolean;
    adminUserId: number;
    canchas: any[];
    establecimientoId: number;
    onCancelar: (id: number) => Promise<void>;
    onCrear: (data: { canchaId: number; fecha: string; horaInicio: string; horaFin: string; descripcion: string }) => Promise<void>;
    onEditar: (id: number, data: { canchaId: number; fecha: string; horaInicio: string; horaFin: string; descripcion: string }) => Promise<void>;
}

const FILTROS_ESTADO = [
    { key: 'todas', label: 'Todos' },
    { key: 'CONFIRMADA', label: 'Confirmadas' },
    { key: 'PENDIENTE_PAGO', label: 'Pendiente pago' },
    { key: 'CANCELADA', label: 'Canceladas' },
];

const COLUMNAS_ORDEN: { key: OrdenKey; label: string }[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'cancha', label: 'Cancha' },
    { key: 'estado', label: 'Estado' },
];

export default function VistaReservasEstablecimiento({ reservas, pagos, loading, adminUserId, canchas, establecimientoId, onCancelar, onCrear, onEditar }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [filtroTiempo, setFiltroTiempo] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [ordenPor, setOrdenPor] = useState<OrdenKey>('fecha');
    const [ordenDir, setOrdenDir] = useState<'asc' | 'desc'>('desc');
    const [modalVisible, setModalVisible] = useState(false);
    const [reservaDetalle, setReservaDetalle] = useState<any | null>(null);
    const [reservaEditando, setReservaEditando] = useState<any | null>(null);

    const toggleOrden = (col: OrdenKey) => {
        if (ordenPor === col) setOrdenDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setOrdenPor(col); setOrdenDir('asc'); }
    };

    const reservasFiltradas = useMemo(() => {
        const valorOrden = (res: any): string => {
            if (ordenPor === 'fecha') return res.fecha ?? '';
            if (ordenPor === 'cliente') return res.usuario?.nombre?.toLowerCase() ?? '';
            if (ordenPor === 'cancha') return res.cancha?.codigo?.toLowerCase() ?? '';
            return res.estadoReserva ?? '';
        };

        return reservas
            .filter(res => {
                const matchBusqueda =
                    res.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                    res.cancha?.codigo?.toLowerCase().includes(busqueda.toLowerCase());

                const fechaReserva = new Date(res.fecha + 'T00:00:00');
                const hoy = new Date();
                let matchTiempo = true;

                if (filtroTiempo === 'hoy') {
                    matchTiempo = fechaReserva.toDateString() === hoy.toDateString();
                } else if (filtroTiempo === 'semana') {
                    const haceUnaSemana = new Date();
                    haceUnaSemana.setDate(hoy.getDate() - 7);
                    matchTiempo = fechaReserva >= haceUnaSemana;
                } else if (filtroTiempo === 'mes') {
                    matchTiempo = fechaReserva.getMonth() === hoy.getMonth() && fechaReserva.getFullYear() === hoy.getFullYear();
                }

                const matchEstado = filtroEstado === 'todas' || res.estadoReserva === filtroEstado;
                return matchBusqueda && matchTiempo && matchEstado;
            })
            .sort((a, b) => {
                const va = valorOrden(a);
                const vb = valorOrden(b);
                return ordenDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            });
    }, [reservas, busqueda, filtroTiempo, filtroEstado, ordenPor, ordenDir]);

    const esDeAdmin = (res: any) => {
        const uid = res.usuario?.usuarioId ?? res.usuario?.idUsuario ?? res.usuario?.id;
        return Number(uid) === adminUserId;
    };

    const getPago = (res: any) => {
        const id = res.reservaId ?? res.idReserva;
        return pagos.find(p => p.reservaId === id) ?? null;
    };

    const IconoOrden = ({ col }: { col: OrdenKey }) => {
        if (ordenPor !== col) return <ArrowUpDown size={13} className="opacity-40" />;
        return ordenDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
    };

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
            <ModalDetalleReserva
                visible={reservaDetalle !== null}
                reserva={reservaDetalle}
                pago={reservaDetalle ? getPago(reservaDetalle) : null}
                esDeAdmin={reservaDetalle ? esDeAdmin(reservaDetalle) : false}
                onCerrar={() => setReservaDetalle(null)}
                onEditar={() => { setReservaEditando(reservaDetalle); setReservaDetalle(null); }}
                onCancelar={onCancelar}
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
                            <Plus size={16} /> Nueva reserva
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        {['todas', 'hoy', 'semana', 'mes'].map((tipo) => (
                            <button key={tipo} onClick={() => setFiltroTiempo(tipo)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${filtroTiempo === tipo ? 'bg-[#03292e] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtro estado + Sort */}
                <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {FILTROS_ESTADO.map(({ key, label }) => (
                            <button key={key} onClick={() => setFiltroEstado(key)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${filtroEstado === key ? 'bg-[#0ed1e8] text-[#03292e]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Ordenar:</span>
                        {COLUMNAS_ORDEN.map(({ key, label }) => (
                            <button key={key} onClick={() => toggleOrden(key)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${ordenPor === key ? 'bg-[#03292e] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                {label} <IconoOrden col={key} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonReservaItem key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reservasFiltradas.length > 0 ? (
                        reservasFiltradas.map((res: any, index: number) => {
                            const id = res.reservaId ?? res.idReserva;
                            const esMia = esDeAdmin(res);
                            const estado = getEstadoDisplay(res.estadoReserva, res.fecha);
                            const modificable = puedeModificar(res.estadoReserva, res.fecha);

                            return (
                                <button key={id ?? index} onClick={() => setReservaDetalle(res)}
                                    className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0ed1e8]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left w-full group">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${modificable ? 'bg-[#e6effc] text-[#03292e] group-hover:bg-[#0ed1e8]/20' : 'bg-gray-100 text-gray-400'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#03292e]">
                                                {res.usuario?.nombre || 'Cliente Anónimo'}
                                                {esMia && (
                                                    <span className="ml-2 text-[10px] font-bold bg-[#0ed1e8]/20 text-[#03292e] px-2 py-0.5 rounded-full">Tu reserva</span>
                                                )}
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
                                                {res.horaInicio?.slice(0, 5)} - {res.horaFin?.slice(0, 5)}
                                            </span>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${estado.colorLight}`}>
                                            {estado.label}
                                        </span>
                                    </div>
                                </button>
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
