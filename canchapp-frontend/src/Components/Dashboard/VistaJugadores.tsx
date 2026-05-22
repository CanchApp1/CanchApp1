import { useMemo, useState } from 'react';
import { Search, User, Calendar, Clock, ChevronLeft, Phone, Mail } from 'lucide-react';
import { getEstadoDisplay } from '../../utils/reservaUtils';

interface Props {
    reservas: any[];
    loading: boolean;
}

export default function VistaJugadores({ reservas, loading }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState<any | null>(null);

    // Derivar jugadores únicos desde las reservas del establecimiento
    const jugadores = useMemo(() => {
        const mapa: Record<number, any> = {};
        for (const res of reservas) {
            const uid = res.usuario?.idUsuario ?? res.usuario?.usuarioId;
            if (!uid) continue;
            if (!mapa[uid]) {
                mapa[uid] = { ...res.usuario, idUsuario: uid, reservasEnEstablecimiento: [] };
            }
            mapa[uid].reservasEnEstablecimiento.push(res);
        }
        return Object.values(mapa) as any[];
    }, [reservas]);

    const jugadoresFiltrados = useMemo(() =>
        jugadores.filter(j =>
            j.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            j.correo?.toLowerCase().includes(busqueda.toLowerCase())
        ),
        [jugadores, busqueda]
    );

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ed1e8]" />
        </div>
    );

    // Vista detalle del jugador
    if (jugadorSeleccionado) {
        const reservasJugador = jugadorSeleccionado.reservasEnEstablecimiento ?? [];
        const totalGastado = reservasJugador.reduce((sum: number, r: any) => {
            const h1 = parseInt(r.horaInicio?.split(':')[0] || '0');
            const h2 = parseInt(r.horaFin?.split(':')[0] || '0');
            return sum + ((r.cancha?.precioPorHora ?? 0) * Math.max(0, h2 - h1));
        }, 0);

        return (
            <div className="space-y-6">
                <button onClick={() => setJugadorSeleccionado(null)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#03292e] transition-colors">
                    <ChevronLeft size={18} /> Volver a jugadores
                </button>

                {/* Perfil */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-[#0ed1e8]/20 flex items-center justify-center text-[#03292e] text-2xl font-black">
                            {jugadorSeleccionado.nombre?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#03292e]">{jugadorSeleccionado.nombre}</h2>
                            <p className="text-sm text-gray-400 font-bold">Jugador</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <Mail size={16} className="text-[#0ed1e8] shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo</p>
                                <p className="text-sm font-bold text-[#03292e] truncate">{jugadorSeleccionado.correo ?? '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <Phone size={16} className="text-[#0ed1e8] shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono</p>
                                <p className="text-sm font-bold text-[#03292e]">{jugadorSeleccionado.numeroTelefono ?? '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-[#0ed1e8]/10 rounded-2xl">
                            <Calendar size={16} className="text-[#0ed1e8] shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total reservas</p>
                                <p className="text-sm font-bold text-[#03292e]">{reservasJugador.length}</p>
                            </div>
                        </div>
                    </div>
                    {totalGastado > 0 && (
                        <div className="mt-4 p-4 bg-green-50 rounded-2xl flex items-center justify-between">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Gasto estimado en tu establecimiento</p>
                            <p className="text-xl font-black text-[#03292e]">${new Intl.NumberFormat('de-DE').format(totalGastado)}</p>
                        </div>
                    )}
                </div>

                {/* Historial */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-[#03292e] mb-4">Historial de reservas en tu establecimiento</h3>
                    <div className="flex flex-col gap-3">
                        {reservasJugador.length > 0 ? (
                            [...reservasJugador]
                                .sort((a: any, b: any) => b.fecha.localeCompare(a.fecha))
                                .map((res: any) => {
                                    const estado = getEstadoDisplay(res.estadoReserva, res.fecha);
                                    return (
                                        <div key={res.reservaId ?? res.idReserva}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                                                    <Calendar size={16} className="text-[#0ed1e8]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#03292e]">{res.fecha} • {res.cancha?.codigo}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={11} /> {res.horaInicio?.slice(0, 5)} — {res.horaFin?.slice(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${estado.colorLight}`}>
                                                {estado.label}
                                            </span>
                                        </div>
                                    );
                                })
                        ) : (
                            <p className="text-center text-gray-400 py-8 text-sm">Sin reservas registradas.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Lista de jugadores
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-1">
                    <div>
                        <h2 className="text-2xl font-black text-[#03292e]">Mis Clientes</h2>
                        <p className="text-sm text-gray-400">Jugadores que han reservado en tu establecimiento</p>
                    </div>
                    <div className="bg-[#0ed1e8]/10 px-5 py-3 rounded-2xl text-center">
                        <p className="text-2xl font-black text-[#03292e]">{jugadores.length}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">clientes</p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar por nombre o correo..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#0ed1e8] transition-all text-sm"
                    value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-3">
                {jugadoresFiltrados.length > 0 ? (
                    jugadoresFiltrados
                        .sort((a: any, b: any) => (b.reservasEnEstablecimiento?.length ?? 0) - (a.reservasEnEstablecimiento?.length ?? 0))
                        .map((jugador: any) => {
                            const totalRes = jugador.reservasEnEstablecimiento?.length ?? 0;
                            const ultimaRes = jugador.reservasEnEstablecimiento?.[0];
                            return (
                                <button key={jugador.idUsuario}
                                    onClick={() => setJugadorSeleccionado(jugador)}
                                    className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0ed1e8]/40 transition-all flex items-center justify-between gap-4 text-left w-full group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-[#0ed1e8]/10 flex items-center justify-center text-[#03292e] font-black text-lg group-hover:bg-[#0ed1e8]/20 transition-colors">
                                            {jugador.nombre?.[0]?.toUpperCase() ?? <User size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#03292e]">{jugador.nombre}</h4>
                                            <p className="text-xs text-gray-400">{jugador.correo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right shrink-0">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reservas</p>
                                            <p className="text-lg font-black text-[#03292e]">{totalRes}</p>
                                        </div>
                                        {ultimaRes && (
                                            <div className="hidden sm:block">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Última visita</p>
                                                <p className="text-xs font-bold text-gray-600">{ultimaRes.fecha}</p>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No se encontraron clientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
